package com.leomar.gerenciador_campeonatos.controller;

import com.leomar.gerenciador_campeonatos.model.Campeonato;
import com.leomar.gerenciador_campeonatos.repository.CampeonatoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/campeonatos")
public class CampeonatoController {

    private final CampeonatoRepository campeonatoRepository;

    // Injeção de dependência
    public CampeonatoController(CampeonatoRepository campeonatoRepository) {
        this.campeonatoRepository = campeonatoRepository;
    }

    // 1. Rota GET: Lista todos os campeonatos cadastrados
    // O Frontend vai chamar essa rota para montar a tela inicial
    @GetMapping
    public List<Campeonato> listarTodos() {
        return campeonatoRepository.findAll();
    }

    // 2. Rota POST: Recebe os dados do Frontend e salva no SQLite
    // A anotação @RequestBody diz ao Spring para converter o JSON que vem do Front em um objeto Java
    @PostMapping
    public ResponseEntity<Campeonato> criarCampeonato(@RequestBody Campeonato novoCampeonato) {
        Campeonato campeonatoSalvo = campeonatoRepository.save(novoCampeonato);

        // Retorna o status 201 (Created) avisando o Front que deu tudo certo
        return ResponseEntity.status(HttpStatus.CREATED).body(campeonatoSalvo);
    }

    // 3. Rota GET por ID: Busca os detalhes de apenas um campeonato
    @GetMapping("/{id}")
    public ResponseEntity<Campeonato> buscarPorId(@PathVariable Long id) {
        return campeonatoRepository.findById(id)
                .map(campeonato -> ResponseEntity.ok().body(campeonato))
                .orElse(ResponseEntity.notFound().build()); // Retorna erro 404 se não achar
    }
}