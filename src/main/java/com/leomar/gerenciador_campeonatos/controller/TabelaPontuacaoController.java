package com.leomar.gerenciador_campeonatos.controller;

import com.leomar.gerenciador_campeonatos.model.TabelaPontuacao;
import com.leomar.gerenciador_campeonatos.repository.TabelaPontuacaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tabelas")
@CrossOrigin(origins = "*")
public class TabelaPontuacaoController {

    private final TabelaPontuacaoRepository tabelaRepository;

    public TabelaPontuacaoController(TabelaPontuacaoRepository tabelaRepository) {
        this.tabelaRepository = tabelaRepository;
    }

    @GetMapping
    public List<TabelaPontuacao> listarTodas() {
        return tabelaRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<TabelaPontuacao> criarTabela(@RequestBody TabelaPontuacao novaTabela) {
        TabelaPontuacao salva = tabelaRepository.save(novaTabela);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }
}