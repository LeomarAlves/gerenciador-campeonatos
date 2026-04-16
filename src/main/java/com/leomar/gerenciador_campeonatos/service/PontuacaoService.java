package com.leomar.gerenciador_campeonatos.service;

import com.leomar.gerenciador_campeonatos.dto.ClassificacaoDTO;
import com.leomar.gerenciador_campeonatos.model.*;
import com.leomar.gerenciador_campeonatos.repository.ResultadoBateriaRepository;
import com.leomar.gerenciador_campeonatos.repository.TabelaPontuacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PontuacaoService {

    private final ResultadoBateriaRepository resultadoRepository;
    private final TabelaPontuacaoRepository tabelaRepository;

    public PontuacaoService(ResultadoBateriaRepository resultadoRepository, TabelaPontuacaoRepository tabelaRepository) {
        this.resultadoRepository = resultadoRepository;
        this.tabelaRepository = tabelaRepository;
    }

    /**
     * Calcula os pontos de cada piloto em uma bateria específica baseado em sua categoria.
     */
    @Transactional
    public void calcularPontosDaBateria(Long bateriaId, Long tabelaId) {
        TabelaPontuacao tabela = tabelaRepository.findById(tabelaId)
                .orElseThrow(() -> new NoSuchElementException("Tabela de pontuação não encontrada: ID " + tabelaId));

        List<ResultadoBateria> gridGeral = resultadoRepository.findByBateriaIdOrderByPosicaoChegadaAsc(bateriaId);
        
        // Agrupa por categoria para que a posição seja relativa aos concorrentes diretos
        Map<Categoria, List<ResultadoBateria>> resultadosPorCategoria = gridGeral.stream()
                .collect(Collectors.groupingBy(resultado -> resultado.getPiloto().getCategoria()));

        resultadosPorCategoria.values().forEach(resultados -> atribuirPontosPorCategoria(resultados, tabela));

        resultadoRepository.saveAll(gridGeral);
    }

    private void atribuirPontosPorCategoria(List<ResultadoBateria> resultados, TabelaPontuacao tabela) {
        for (int i = 0; i < resultados.size(); i++) {
            ResultadoBateria resultado = resultados.get(i);
            
            if (resultado.isNc()) {
                resultado.setPontos(0);
                continue;
            }

            int posicaoNaCategoria = i + 1;
            int pontos = tabela.getPontosPorPosicao().getOrDefault(posicaoNaCategoria, 0);
            resultado.setPontos(pontos);
        }
    }

    /**
     * Consolida os resultados de múltiplas baterias em um ranking por categoria.
     */
    public Map<String, List<ClassificacaoDTO>> gerarRelatorioFinalSelecionado(List<Long> bateriaIds) {
        List<ResultadoBateria> resultados = resultadoRepository.findByBateriaIdIn(bateriaIds);

        return resultados.stream()
                .collect(Collectors.groupingBy(r -> r.getPiloto().getCategoria()))
                .entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getKey().getNome(),
                        entry -> processarClassificacaoCategoria(entry.getValue()),
                        (v1, v2) -> v1,
                        LinkedHashMap::new
                ));
    }

    private List<ClassificacaoDTO> processarClassificacaoCategoria(List<ResultadoBateria> resultadosCategoria) {
        Map<Piloto, List<ResultadoBateria>> resultadosPorPiloto = resultadosCategoria.stream()
                .collect(Collectors.groupingBy(ResultadoBateria::getPiloto));

        return resultadosPorPiloto.entrySet().stream()
                .map(entry -> criarClassificacaoDTO(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(ClassificacaoDTO::getTotalPontos).reversed())
                .collect(Collectors.toList());
    }

    private ClassificacaoDTO criarClassificacaoDTO(Piloto piloto, List<ResultadoBateria> resultadosDoPiloto) {
        ClassificacaoDTO dto = new ClassificacaoDTO();
        dto.setPiloto(piloto);
        
        int total = 0;
        for (ResultadoBateria r : resultadosDoPiloto) {
            int pontos = (r.getPontos() != null) ? r.getPontos() : 0;
            total += pontos;

            String valorExibicao = r.isNc() ? "NC" : String.valueOf(pontos);
            dto.getResultadosPorBateria().put(r.getBateria().getNome(), valorExibicao);
        }

        dto.setTotalPontos(total);
        return dto;
    }

    public List<ClassificacaoDTO> gerarClassificacaoFinal(Long id) {
        return List.of();
    }

}