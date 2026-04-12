package com.leomar.gerenciador_campeonatos.service;

import com.leomar.gerenciador_campeonatos.model.*;
import com.leomar.gerenciador_campeonatos.repository.ResultadoBateriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PontuacaoService {

    private final ResultadoBateriaRepository resultadoRepository;

    // Injeção de dependência via construtor (Boa prática do Spring)
    public PontuacaoService(ResultadoBateriaRepository resultadoRepository) {
        this.resultadoRepository = resultadoRepository;
    }

    public void processarGridMisto(Long bateriaId) {
        // 1. Busca todos os resultados da corrida já ordenados pela posição geral na pista
        List<ResultadoBateria> gridGeral = resultadoRepository
                .findByBateriaIdOrderByPosicaoChegadaAsc(bateriaId);

        // 2. Agrupa os resultados em um Map, separando-os por Categoria
        Map<Categoria, List<ResultadoBateria>> resultadosPorCategoria = gridGeral.stream()
                .collect(Collectors.groupingBy(resultado -> resultado.getPiloto().getCategoria()));

        // 3. O NOVO PASSO: Percorre cada grupo de categoria que foi separado
        for (Map.Entry<Categoria, List<ResultadoBateria>> grupo : resultadosPorCategoria.entrySet()) {

            Categoria categoria = grupo.getKey();
            List<ResultadoBateria> resultadosDaCategoria = grupo.getValue();

            // 4. Agora sim, percorre a lista de resultados apenas dessa categoria
            for (int i = 0; i < resultadosDaCategoria.size(); i++) {
                ResultadoBateria resultado = resultadosDaCategoria.get(i);
                int posicaoNaCategoria = i + 1; // Índice 0 é o 1º lugar

                // Buscando os pontos na tabela da categoria
                TabelaPontuacao tabela = categoria.getTabelaPontuacao();
                if (tabela != null) {
                    Integer pontos = tabela.getPontosPorPosicao().getOrDefault(posicaoNaCategoria, 0);
                    resultado.setPontos(pontos);
                } else {
                    resultado.setPontos(0); // Se não tem tabela, não ganha pontos
                }

            }
        }

        // (No mundo real, aqui você faria resultadoRepository.saveAll(gridGeral) para salvar no SQLite)
    }
}
