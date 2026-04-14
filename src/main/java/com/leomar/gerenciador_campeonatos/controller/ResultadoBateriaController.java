package com.leomar.gerenciador_campeonatos.controller;

import com.leomar.gerenciador_campeonatos.model.ResultadoBateria;
import com.leomar.gerenciador_campeonatos.repository.ResultadoBateriaRepository;
import com.leomar.gerenciador_campeonatos.service.PontuacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resultados")
@CrossOrigin(origins = "*")
public class ResultadoBateriaController {

    private final ResultadoBateriaRepository resultadoRepository;
    private final PontuacaoService pontuacaoService;

    public ResultadoBateriaController(ResultadoBateriaRepository resultadoRepository, PontuacaoService pontuacaoService) {
        this.resultadoRepository = resultadoRepository;
        this.pontuacaoService = pontuacaoService;
    }

    // ROTA PARA O FRONTEND LER OS RESULTADOS (O que provavelmente estava faltando!)
    @GetMapping
    public List<ResultadoBateria> listarTodos() {
        return resultadoRepository.findAll();
    }

    // ROTA PARA O FRONTEND SALVAR A POSIÇÃO DE CHEGADA
    @PostMapping
    public ResponseEntity<ResultadoBateria> registrarResultado(@RequestBody ResultadoBateria novoResultado) {
        ResultadoBateria salvo = resultadoRepository.save(novoResultado);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // O BOTÃO MÁGICO (Que nós já havíamos configurado)
    @PostMapping("/calcular/{bateriaId}")
    public ResponseEntity<String> calcularPontosDaBateria(
            @PathVariable Long bateriaId,
            @RequestParam Long tabelaId) {

        pontuacaoService.processarGridMisto(bateriaId, tabelaId);
        return ResponseEntity.ok("Pontos calculados com sucesso!");
    }
}