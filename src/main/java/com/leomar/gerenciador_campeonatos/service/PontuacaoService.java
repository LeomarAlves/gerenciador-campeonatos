package com.leomar.gerenciador_campeonatos.service;

import com.leomar.gerenciador_campeonatos.model.Categoria;
import com.leomar.gerenciador_campeonatos.model.ResultadoBateria;
import com.leomar.gerenciador_campeonatos.model.TabelaPontuacao;
import com.leomar.gerenciador_campeonatos.repository.ResultadoBateriaRepository;
import com.leomar.gerenciador_campeonatos.repository.TabelaPontuacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PontuacaoService {

    private final ResultadoBateriaRepository resultadoRepository;
    private final TabelaPontuacaoRepository tabelaPontuacaoRepository; // NOVO REPOSITÓRIO AQUI

    // Injeção de dependências pelo construtor (O Spring faz a mágica de preencher isso)
    public PontuacaoService(ResultadoBateriaRepository resultadoRepository,
                            TabelaPontuacaoRepository tabelaPontuacaoRepository) {
        this.resultadoRepository = resultadoRepository;
        this.tabelaPontuacaoRepository = tabelaPontuacaoRepository;
    }

    public void processarGridMisto(Long bateriaId, Long tabelaId) {
        // 1. Busca a tabela no banco de dados usando o ID que veio da tela
        TabelaPontuacao tabela = tabelaPontuacaoRepository.findById(tabelaId)
                .orElseThrow(() -> new RuntimeException("Tabela não encontrada"));

        // 2. RECUPERADO: Busca a ordem de chegada geral daquela bateria específica
        List<ResultadoBateria> gridGeral = resultadoRepository.findByBateriaIdOrderByPosicaoChegadaAsc(bateriaId);

        // 3. Agrupa os resultados em um Map, separando-os por Categoria
        Map<Categoria, List<ResultadoBateria>> resultadosPorCategoria = gridGeral.stream()
                .collect(Collectors.groupingBy(resultado -> resultado.getPiloto().getCategoria()));

        // 4. Percorre cada grupo de categoria que foi separado
        for (Map.Entry<Categoria, List<ResultadoBateria>> grupo : resultadosPorCategoria.entrySet()) {

            List<ResultadoBateria> resultadosDaCategoria = grupo.getValue();

            // 5. Agora sim, percorre a lista de resultados apenas dessa categoria
            for (int i = 0; i < resultadosDaCategoria.size(); i++) {
                ResultadoBateria resultado = resultadosDaCategoria.get(i);
                int posicaoNaCategoria = i + 1; // Índice 0 é o 1º lugar

                // Busca os pontos no Map da tabela que foi selecionada
                Integer pontos = tabela.getPontosPorPosicao().get(posicaoNaCategoria);

                if (pontos != null) {
                    resultado.setPontos(pontos);
                } else {
                    resultado.setPontos(0); // Se chegou além de onde a tabela premia, ganha 0
                }
            }
        }

        // 6. Salva todos os resultados atualizados de uma vez só no banco SQLite
        resultadoRepository.saveAll(gridGeral);
    }
}