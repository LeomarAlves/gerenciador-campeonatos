package com.leomar.gerenciador_campeonatos.controller;

import com.leomar.gerenciador_campeonatos.dto.ClassificacaoDTO;
import com.leomar.gerenciador_campeonatos.dto.RankingItem;
import com.leomar.gerenciador_campeonatos.model.Piloto;
import com.leomar.gerenciador_campeonatos.service.PontuacaoService;
import com.leomar.gerenciador_campeonatos.service.RelatorioService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// 1. Avisa o Spring que esta classe vai expor rotas na internet
@RestController
@CrossOrigin(origins = "*")
// 2. Define o endereço base. Tudo aqui começará com /api/relatorios
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;
    private final PontuacaoService pontuacaoService; // ADICIONADO: O Motor de Matemática

    // ATUALIZADO: O construtor agora recebe os dois serviços
    public RelatorioController(RelatorioService relatorioService, PontuacaoService pontuacaoService) {
        this.relatorioService = relatorioService;
        this.pontuacaoService = pontuacaoService;
    }

    // ========================================================================
    // NOVA ROTA: Gera os dados do pódio separando as categorias mistas (F4 A, F4 B)
    // Exemplo de chamada do Frontend: /api/relatorios/etapa?bateriasIds=1,2,3
    // ========================================================================
    @GetMapping("/etapa")
    public ResponseEntity<Map<String, List<ClassificacaoDTO>>> gerarRelatorioEtapa(
            @RequestParam List<Long> bateriasIds) {

        // Se o frontend mandar a requisição sem nenhuma bateria selecionada, recusa.
        if (bateriasIds == null || bateriasIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Chama a lógica de Merge e separação de categorias que está no Service
        Map<String, List<ClassificacaoDTO>> resultado = pontuacaoService.gerarRelatorioFinalSelecionado(bateriasIds);

        return ResponseEntity.ok(resultado);
    }

    // ========================================================================
    // SUA ROTA ANTIGA (Mantida exatamente como você fez)
    // ========================================================================
    @GetMapping("/teste-pdf")
    public ResponseEntity<byte[]> testarPdfNoNavegador() {

        // --- PREPARANDO DADOS FALSOS SÓ PARA O TESTE VISUAL ---
        Piloto p1 = new Piloto(); p1.setNome("Ayrton Senna");
        RankingItem r1 = new RankingItem(); r1.setPiloto(p1); r1.setTotalPontos(50);

        Piloto p2 = new Piloto(); p2.setNome("Alain Prost");
        RankingItem r2 = new RankingItem(); r2.setPiloto(p2); r2.setTotalPontos(42);

        List<RankingItem> rankingFalso = List.of(r1, r2);
        // ------------------------------------------------------

        // Chama o Service que você acabou de criar para desenhar o PDF
        byte[] arquivoPdf = relatorioService.gerarRelatorioFinal("Copa Univali de Kart", "Pró", rankingFalso);

        // Configura o "envelope" da resposta para avisar o navegador que é um Download
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        // A linha abaixo força o navegador a baixar o arquivo com este nome
        headers.setContentDispositionFormData("attachment", "resultado-campeonato.pdf");

        // Devolve o arquivo empacotado com status 200 (OK)
        return ResponseEntity.ok()
                .headers(headers)
                .body(arquivoPdf);
    }
}