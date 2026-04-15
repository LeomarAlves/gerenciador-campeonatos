package com.leomar.gerenciador_campeonatos.controller;

import com.leomar.gerenciador_campeonatos.dto.ClassificacaoDTO;
import com.leomar.gerenciador_campeonatos.service.PontuacaoService;
import com.leomar.gerenciador_campeonatos.service.RelatorioService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;
    private final PontuacaoService pontuacaoService;

    public RelatorioController(RelatorioService relatorioService, PontuacaoService pontuacaoService) {
        this.relatorioService = relatorioService;
        this.pontuacaoService = pontuacaoService;
    }

    // 1. Rota para gerar a tabela na tela
    @GetMapping("/etapa")
    public ResponseEntity<Map<String, List<ClassificacaoDTO>>> gerarRelatorioEtapa(
            @RequestParam List<Long> bateriasIds) {

        if (bateriasIds == null || bateriasIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Map<String, List<ClassificacaoDTO>> resultado = pontuacaoService.gerarRelatorioFinalSelecionado(bateriasIds);
        return ResponseEntity.ok(resultado);
    }

    // 2. Rota para baixar o PDF Oficial
    @GetMapping("/etapa/pdf")
    public ResponseEntity<byte[]> baixarRelatorioPdf(
            @RequestParam List<Long> bateriasIds,
            @RequestParam String nomeCampeonato) {

        if (bateriasIds == null || bateriasIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Map<String, List<ClassificacaoDTO>> relatorioMisto = pontuacaoService.gerarRelatorioFinalSelecionado(bateriasIds);
        byte[] arquivoPdf = relatorioService.gerarRelatorioFinalPdf(nomeCampeonato, relatorioMisto);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Resultado_Oficial_" + nomeCampeonato.replace(" ", "_") + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(arquivoPdf);
    }
}