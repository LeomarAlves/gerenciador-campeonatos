package com.leomar.gerenciador_campeonatos.service;

import com.leomar.gerenciador_campeonatos.model.*;
import com.leomar.gerenciador_campeonatos.repository.ResultadoBateriaRepository;
import com.leomar.gerenciador_campeonatos.repository.TabelaPontuacaoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;

// Diz ao JUnit para ativar o Mockito neste arquivo
@ExtendWith(MockitoExtension.class)
class PontuacaoServiceTest {

    // Cria o dublê falso do banco de dados
    @Mock
    private ResultadoBateriaRepository resultadoRepository;

    @Mock
    private TabelaPontuacaoRepository tabelaRepository;

    // Injeta o dublê dentro do nosso Service real
    @InjectMocks
    private PontuacaoService pontuacaoService;

    @Test
    void deveCalcularPontosCorretamenteParaGridMisto() {
        // ==========================================
        // 1. ARRANGE (PREPARAÇÃO DOS DADOS FALSOS)
        // ==========================================

        // Criamos uma Tabela de Pontos Fake (1º=25, 2º=18, 3º=15)
        TabelaPontuacao tabelaPro = new TabelaPontuacao();
        tabelaPro.getPontosPorPosicao().put(1, 25);
        tabelaPro.getPontosPorPosicao().put(2, 18);
        tabelaPro.getPontosPorPosicao().put(3, 15);

        Mockito.when(tabelaRepository.findById(1L)).thenReturn(java.util.Optional.of(tabelaPro));

        // Criamos as categorias e vinculamos a tabela
        Categoria categoriaPro = new Categoria();
        categoriaPro.setNome("Pró");
        categoriaPro.setTabelaPontuacao(tabelaPro); // Pró usa a tabela

        Categoria categoriaIniciante = new Categoria();
        categoriaIniciante.setNome("Iniciantes");
        categoriaIniciante.setTabelaPontuacao(tabelaPro);

        // Criamos os pilotos
        Piloto pilotoA = new Piloto(); pilotoA.setCategoria(categoriaPro);
        Piloto pilotoB = new Piloto(); pilotoB.setCategoria(categoriaIniciante);
        Piloto pilotoC = new Piloto(); pilotoC.setCategoria(categoriaPro);

        // Simulamos o Grid Misto (Ordem de chegada na pista)
        ResultadoBateria resultado1 = new ResultadoBateria();
        resultado1.setPiloto(pilotoA); resultado1.setPosicaoChegada(1); // 1º Geral (Pró)

        ResultadoBateria resultado2 = new ResultadoBateria();
        resultado2.setPiloto(pilotoB); resultado2.setPosicaoChegada(2); // 2º Geral (Inic)

        ResultadoBateria resultado3 = new ResultadoBateria();
        resultado3.setPiloto(pilotoC); resultado3.setPosicaoChegada(3); // 3º Geral (Pró)

        List<ResultadoBateria> gridFalso = List.of(resultado1, resultado2, resultado3);

        // O COMANDO DO MOCKITO: Treinando o dublê de banco de dados
        // "Quando pedirem a bateria ID 1, não vá ao banco. Entregue o gridFalso."
        Mockito.when(resultadoRepository.findByBateriaIdOrderByPosicaoChegadaAsc(1L))
                .thenReturn(gridFalso);

        Long tabelaId = 1L;

        pontuacaoService.calcularPontosDaBateria(1L, tabelaId);

        // assertEquals(VALOR_ESPERADO, VALOR_REAL_QUE_O_SEU_CODIGO_GEROU)
        assertEquals(25, resultado1.getPontos(), "O 1º da Pró deve ganhar 25 pts");
        assertEquals(18, resultado3.getPontos(), "O 2º da Pró (3º geral) deve ganhar 18 pts");
    }
}