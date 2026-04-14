package com.leomar.gerenciador_campeonatos.service;

import com.leomar.gerenciador_campeonatos.dto.ClassificacaoDTO;
import com.leomar.gerenciador_campeonatos.model.*;
import com.leomar.gerenciador_campeonatos.repository.ResultadoBateriaRepository;
import com.leomar.gerenciador_campeonatos.repository.TabelaPontuacaoRepository;
import org.springframework.stereotype.Service;

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

    // ========================================================================
    // 1. CALCULA PONTOS DA BATERIA (Respeitando a Categoria do Piloto)
    // ========================================================================
    public void calcularPontosDaBateria(Long bateriaId, Long tabelaId) {
        TabelaPontuacao tabela = tabelaRepository.findById(tabelaId)
                .orElseThrow(() -> new RuntimeException("Tabela não encontrada"));

        List<ResultadoBateria> gridGeral = resultadoRepository.findByBateriaIdOrderByPosicaoChegadaAsc(bateriaId);

        Map<Categoria, List<ResultadoBateria>> separadosPorCategoria = gridGeral.stream()
                .collect(Collectors.groupingBy(resultado -> resultado.getPiloto().getCategoria()));

        for (List<ResultadoBateria> resultadosDaSubcategoria : separadosPorCategoria.values()) {
            for (int i = 0; i < resultadosDaSubcategoria.size(); i++) {
                ResultadoBateria resultado = resultadosDaSubcategoria.get(i);
                int posicaoNaCategoria = i + 1;
                Integer pontos = tabela.getPontosPorPosicao().getOrDefault(posicaoNaCategoria, 0);
                resultado.setPontos(pontos);
            }
        }
        resultadoRepository.saveAll(gridGeral);
    }

    // ========================================================================
    // 2. O MERGE FINAL: Soma as baterias e separa o Pódio por Subcategoria
    // ========================================================================
    public Map<String, List<ClassificacaoDTO>> gerarRelatorioFinalSelecionado(List<Long> bateriaIds) {
        List<ResultadoBateria> resultadosSelecionados = resultadoRepository.findByBateriaIdIn(bateriaIds);

        Map<Categoria, List<ResultadoBateria>> resultadosPorCategoria = resultadosSelecionados.stream()
                .collect(Collectors.groupingBy(r -> r.getPiloto().getCategoria()));

        Map<String, List<ClassificacaoDTO>> relatorioFinal = new LinkedHashMap<>();

        for (Map.Entry<Categoria, List<ResultadoBateria>> entry : resultadosPorCategoria.entrySet()) {
            Categoria categoria = entry.getKey();
            List<ResultadoBateria> resultadosDaCategoria = entry.getValue();

            Map<Piloto, Integer> pontosPorPiloto = resultadosDaCategoria.stream()
                    .filter(r -> r.getPontos() != null)
                    .collect(Collectors.groupingBy(
                            ResultadoBateria::getPiloto,
                            Collectors.summingInt(ResultadoBateria::getPontos)
                    ));

            List<ClassificacaoDTO> podio = pontosPorPiloto.entrySet().stream()
                    .map(p -> new ClassificacaoDTO(p.getKey(), p.getValue()))
                    .collect(Collectors.toList());

            podio.sort((a, b) -> b.getTotalPontos().compareTo(a.getTotalPontos()));
            relatorioFinal.put(categoria.getNome(), podio);
        }
        return relatorioFinal;
    }

    // ========================================================================
    // 3. A CORREÇÃO DO ERRO (Método Antigo)
    // ========================================================================
    public List<ClassificacaoDTO> gerarClassificacaoFinal(Long id) {
        // Retorna uma lista vazia apenas para satisfazer o Java e não quebrar rotas antigas.
        // O nosso sistema agora usa o gerarRelatorioFinalSelecionado!
        return Collections.emptyList();
    }
}