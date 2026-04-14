package com.leomar.gerenciador_campeonatos.service;

import com.leomar.gerenciador_campeonatos.dto.ClassificacaoDTO;
import com.leomar.gerenciador_campeonatos.model.Categoria;
import com.leomar.gerenciador_campeonatos.model.Piloto;
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
    private final TabelaPontuacaoRepository tabelaPontuacaoRepository;

    // Construtor com Injeção de Dependências
    public PontuacaoService(ResultadoBateriaRepository resultadoRepository,
                            TabelaPontuacaoRepository tabelaPontuacaoRepository) {
        this.resultadoRepository = resultadoRepository;
        this.tabelaPontuacaoRepository = tabelaPontuacaoRepository;
    }

    // ========================================================================
    // FUNÇÃO 1: DIA DA CORRIDA (Separa o Grid Misto e aplica a Tabela Dinâmica)
    // ========================================================================
    public void processarGridMisto(Long bateriaId, Long tabelaId) {

        // 1. Busca a tabela no banco de dados usando o ID que veio da tela
        TabelaPontuacao tabela = tabelaPontuacaoRepository.findById(tabelaId)
                .orElseThrow(() -> new RuntimeException("Tabela de Pontuação não encontrada!"));

        // 2. Busca a ordem de chegada geral daquela bateria específica
        List<ResultadoBateria> gridGeral = resultadoRepository.findByBateriaIdOrderByPosicaoChegadaAsc(bateriaId);

        // 3. Agrupa os resultados em um Map, separando-os por Categoria
        Map<Categoria, List<ResultadoBateria>> resultadosPorCategoria = gridGeral.stream()
                .collect(Collectors.groupingBy(resultado -> resultado.getPiloto().getCategoria()));

        // 4. Percorre cada grupo de categoria que foi separado
        for (Map.Entry<Categoria, List<ResultadoBateria>> grupo : resultadosPorCategoria.entrySet()) {

            List<ResultadoBateria> resultadosDaCategoria = grupo.getValue();

            // 5. Percorre a lista de resultados apenas dessa categoria
            for (int i = 0; i < resultadosDaCategoria.size(); i++) {
                ResultadoBateria resultado = resultadosDaCategoria.get(i);

                // O índice i começa em 0, então a posição real na categoria é i + 1
                int posicaoNaCategoria = i + 1;

                // Busca os pontos no Map da tabela que foi selecionada
                Integer pontos = tabela.getPontosPorPosicao().get(posicaoNaCategoria);

                if (pontos != null) {
                    resultado.setPontos(pontos);
                } else {
                    resultado.setPontos(0); // Se chegou além de onde a tabela premia, ganha 0 pontos
                }
            }
        }

        // 6. Salva todos os resultados atualizados de uma vez só no banco SQLite
        resultadoRepository.saveAll(gridGeral);
    }

    // ========================================================================
    // FUNÇÃO 2: FIM DO CAMPEONATO (Soma os pontos de todas as baterias)
    // ========================================================================
    public List<ClassificacaoDTO> gerarClassificacaoFinal(Long campeonatoId) {

        // 1. Busca todos os resultados de todas as baterias deste campeonato
        List<ResultadoBateria> todosResultados = resultadoRepository.findByBateriaCampeonatoId(campeonatoId);

        // 2. Agrupa por Piloto e soma os pontos
        Map<Piloto, Integer> pontosPorPiloto = todosResultados.stream()
                // Ignora quem não tem ponto ou foi desclassificado
                .filter(resultado -> resultado.getPontos() != null)
                .collect(Collectors.groupingBy(
                        ResultadoBateria::getPiloto,
                        Collectors.summingInt(ResultadoBateria::getPontos)
                ));

        // 3. Converte o Map (Dicionário) para a nossa lista de DTO (Objeto de Transferência)
        List<ClassificacaoDTO> classificacao = pontosPorPiloto.entrySet().stream()
                .map(entry -> new ClassificacaoDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // 4. Ordena do maior pontuador para o menor (Ordem Decrescente)
        classificacao.sort((a, b) -> b.getTotalPontos().compareTo(a.getTotalPontos()));

        // 5. Retorna a lista pronta para o Controller mandar pro Frontend e gerar o PDF
        return classificacao;
    }
}