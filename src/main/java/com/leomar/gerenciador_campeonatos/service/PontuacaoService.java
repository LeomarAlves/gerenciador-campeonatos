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

    public void calcularPontosDaBateria(Long bateriaId, Long tabelaId) {
        TabelaPontuacao tabela = tabelaRepository.findById(tabelaId)
                .orElseThrow(() -> new RuntimeException("Tabela não encontrada"));

        List<ResultadoBateria> gridGeral = resultadoRepository.findByBateriaIdOrderByPosicaoChegadaAsc(bateriaId);
        Map<Categoria, List<ResultadoBateria>> separadosPorCategoria = gridGeral.stream()
                .collect(Collectors.groupingBy(resultado -> resultado.getPiloto().getCategoria()));

        for (List<ResultadoBateria> resultadosDaSubcategoria : separadosPorCategoria.values()) {
            for (int i = 0; i < resultadosDaSubcategoria.size(); i++) {
                ResultadoBateria resultado = resultadosDaSubcategoria.get(i);

                // SE ELE NÃO COMPLETOU (NC), GANHA 0 PONTOS DIRETO.
                if (resultado.isNc()) {
                    resultado.setPontos(0);
                } else {
                    int posicaoNaCategoria = i + 1;
                    Integer pontos = tabela.getPontosPorPosicao().getOrDefault(posicaoNaCategoria, 0);
                    resultado.setPontos(pontos);
                }
            }
        }
        resultadoRepository.saveAll(gridGeral);
    }

    public Map<String, List<ClassificacaoDTO>> gerarRelatorioFinalSelecionado(List<Long> bateriaIds) {
        List<ResultadoBateria> resultadosSelecionados = resultadoRepository.findByBateriaIdIn(bateriaIds);

        Map<Categoria, List<ResultadoBateria>> resultadosPorCategoria = resultadosSelecionados.stream()
                .collect(Collectors.groupingBy(r -> r.getPiloto().getCategoria()));

        Map<String, List<ClassificacaoDTO>> relatorioFinal = new LinkedHashMap<>();

        for (Map.Entry<Categoria, List<ResultadoBateria>> entry : resultadosPorCategoria.entrySet()) {
            Categoria categoria = entry.getKey();
            List<ResultadoBateria> resultadosDaCategoria = entry.getValue();

            // Agrupa os resultados pelo Piloto
            Map<Piloto, List<ResultadoBateria>> resultadosPorPiloto = resultadosDaCategoria.stream()
                    .collect(Collectors.groupingBy(ResultadoBateria::getPiloto));

            List<ClassificacaoDTO> podio = new ArrayList<>();

            for (Map.Entry<Piloto, List<ResultadoBateria>> pilotoEntry : resultadosPorPiloto.entrySet()) {
                Piloto piloto = pilotoEntry.getKey();
                List<ResultadoBateria> resultadosDoPiloto = pilotoEntry.getValue();

                ClassificacaoDTO dto = new ClassificacaoDTO();
                dto.setPiloto(piloto);

                int total = 0;
                for (ResultadoBateria r : resultadosDoPiloto) {
                    int pontos = (r.getPontos() != null) ? r.getPontos() : 0;
                    total += pontos;

                    // Guarda se foi NC ou os pontos normais com o nome da bateria
                    String valorExibicao = r.isNc() ? "NC" : String.valueOf(pontos);
                    dto.getResultadosPorBateria().put(r.getBateria().getNome(), valorExibicao);
                }

                dto.setTotalPontos(total);
                podio.add(dto);
            }

            podio.sort((a, b) -> b.getTotalPontos().compareTo(a.getTotalPontos()));
            relatorioFinal.put(categoria.getNome(), podio);
        }
        return relatorioFinal;
    }

    public List<ClassificacaoDTO> gerarClassificacaoFinal(Long id) {
        // Retorna uma lista vazia apenas para satisfazer o Java e não quebrar rotas antigas.
        // O nosso sistema agora usa o gerarRelatorioFinalSelecionado!
        return Collections.emptyList();
    }
}