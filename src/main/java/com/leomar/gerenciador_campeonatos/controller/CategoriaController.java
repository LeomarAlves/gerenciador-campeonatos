package com.leomar.gerenciador_campeonatos.controller;

import com.leomar.gerenciador_campeonatos.model.Categoria;
import com.leomar.gerenciador_campeonatos.repository.CategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*") // Permite acesso de qualquer Frontend (CORS)
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    // GET: Lista todas as categorias
    @GetMapping
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    // POST: Salva uma nova categoria no banco
    @PostMapping
    public ResponseEntity<Categoria> criarCategoria(@RequestBody Categoria novaCategoria) {
        Categoria categoriaSalva = categoriaRepository.save(novaCategoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaSalva);
    }

    // GET: Busca uma categoria específica pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable Long id) {
        return categoriaRepository.findById(id)
                .map(categoria -> ResponseEntity.ok().body(categoria))
                .orElse(ResponseEntity.notFound().build());
    }
}