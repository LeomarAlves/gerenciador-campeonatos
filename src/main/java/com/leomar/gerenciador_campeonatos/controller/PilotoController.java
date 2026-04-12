package com.leomar.gerenciador_campeonatos.controller;

import com.leomar.gerenciador_campeonatos.model.Piloto;
import com.leomar.gerenciador_campeonatos.repository.PilotoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pilotos")
@CrossOrigin(origins = "*") // Liberando para o nosso futuro Frontend!
public class PilotoController {

    private final PilotoRepository pilotoRepository;

    public PilotoController(PilotoRepository pilotoRepository) {
        this.pilotoRepository = pilotoRepository;
    }

    // GET: Lista todos os pilotos
    @GetMapping
    public List<Piloto> listarTodos() {
        return pilotoRepository.findAll();
    }

    // POST: Cadastra um novo piloto
    @PostMapping
    public ResponseEntity<Piloto> criarPiloto(@RequestBody Piloto novoPiloto) {
        Piloto pilotoSalvo = pilotoRepository.save(novoPiloto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pilotoSalvo);
    }

    // GET: Busca um piloto específico pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Piloto> buscarPorId(@PathVariable Long id) {
        return pilotoRepository.findById(id)
                .map(piloto -> ResponseEntity.ok().body(piloto))
                .orElse(ResponseEntity.notFound().build());
    }
}