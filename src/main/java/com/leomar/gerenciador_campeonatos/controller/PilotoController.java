package com.leomar.gerenciador_campeonatos.controller;

import com.leomar.gerenciador_campeonatos.model.Bateria;
import com.leomar.gerenciador_campeonatos.model.Piloto;
import com.leomar.gerenciador_campeonatos.repository.BateriaRepository;
import com.leomar.gerenciador_campeonatos.repository.PilotoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/pilotos")
@CrossOrigin(origins = "*") // Liberando para o nosso futuro Frontend!
public class PilotoController {

    private final PilotoRepository pilotoRepository;
    private final BateriaRepository bateriaRepository;

    public PilotoController(PilotoRepository pilotoRepository, BateriaRepository bateriaRepository) {
        this.pilotoRepository = pilotoRepository;
        this.bateriaRepository = bateriaRepository;
    }

    // GET: Lista todos os pilotos
    @GetMapping
    public List<Piloto> listarTodos() {
        return pilotoRepository.findAll();
    }

    @GetMapping("/bateria/{bateriaId}")
    public List<Piloto> listarPorBateria(@PathVariable Long bateriaId) {
        return bateriaRepository.findById(bateriaId)
                .map(bateria -> pilotoRepository.findByCategoriaIn(bateria.getCategorias()))
                .orElse(Collections.emptyList());
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
    // PUT: Atualiza os dados de um piloto existente
    @PutMapping("/{id}")
    public ResponseEntity<Piloto> atualizarPiloto(@PathVariable Long id, @RequestBody Piloto pilotoAtualizado) {
        return pilotoRepository.findById(id)
                .map(pilotoExistente -> {
                    // Atualiza os dados com o que veio do Frontend
                    pilotoExistente.setNome(pilotoAtualizado.getNome());
                    pilotoExistente.setNumeroKart(pilotoAtualizado.getNumeroKart());
                    pilotoExistente.setCategoria(pilotoAtualizado.getCategoria());

                    // Salva a alteração
                    Piloto pilotoSalvo = pilotoRepository.save(pilotoExistente);
                    return ResponseEntity.ok().body(pilotoSalvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        pilotoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}