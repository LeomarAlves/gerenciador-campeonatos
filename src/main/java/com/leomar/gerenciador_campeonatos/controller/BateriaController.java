package com.leomar.gerenciador_campeonatos.controller;

import com.leomar.gerenciador_campeonatos.model.Bateria;
import com.leomar.gerenciador_campeonatos.repository.BateriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/baterias")
@CrossOrigin(origins = "*")
public class BateriaController {

    private final BateriaRepository bateriaRepository;

    public BateriaController(BateriaRepository bateriaRepository) {
        this.bateriaRepository = bateriaRepository;
    }

    @GetMapping("/campeonato/{campeonatoId}")
    public List<Bateria> listarPorCampeonato(@PathVariable Long campeonatoId) {
        return bateriaRepository.findByCampeonatoId(campeonatoId);
    }

    @PostMapping
    public ResponseEntity<Bateria> criarBateria(@RequestBody Bateria novaBateria) {
        Bateria bateriaSalva = bateriaRepository.save(novaBateria);
        return ResponseEntity.status(HttpStatus.CREATED).body(bateriaSalva);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bateria> buscarPorId(@PathVariable Long id) {
        return bateriaRepository.findById(id)
                .map(bateria -> ResponseEntity.ok().body(bateria))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        bateriaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}