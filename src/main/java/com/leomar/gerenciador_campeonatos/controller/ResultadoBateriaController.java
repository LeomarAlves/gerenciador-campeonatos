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
    private final PontuacaoService pontuacaoService; // Injetando o nosso Service!

    public ResultadoBateriaController(ResultadoBateriaRepository resultadoRepository, PontuacaoService pontuacaoService) {
        this.resultadoRepository = resultadoRepository;
        this.pontuacaoService = pontuacaoService;
    }

    // GET: Lista todos os resultados cadastrados
    @GetMapping
    public List<ResultadoBateria> listarTodos() {
        return resultadoRepository.findAll();
    }

    // POST: Cadastra a chegada de um piloto
    @PostMapping
    public ResponseEntity<ResultadoBateria> registrarResultado(@RequestBody ResultadoBateria novoResultado) {
        ResultadoBateria resultadoSalvo = resultadoRepository.save(novoResultado);
        return ResponseEntity.status(HttpStatus.CREATED).body(resultadoSalvo);
    }

    // =========================================================================
    // ROTA ESPECIAL: O botão de "Calcular Campeonato" do Frontend chama isso!
    // =========================================================================
    @PostMapping("/calcular/{bateriaId}")
    public ResponseEntity<String> calcularPontosDaBateria(@PathVariable Long bateriaId) {
        // Chama a regra de negócio complexa que nós construímos e testamos!
        pontuacaoService.processarGridMisto(bateriaId);

        return ResponseEntity.ok("Pontos calculados e separados por categoria com sucesso!");
    }
}