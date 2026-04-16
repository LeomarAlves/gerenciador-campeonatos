package com.leomar.gerenciador_campeonatos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import java.util.List;

@Entity
public class Bateria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private LocalDateTime dataHora;

    // MANTIDO: A bateria continua sabendo qual é o seu campeonato
    @ManyToOne
    @JoinColumn(name = "campeonato_id", nullable = false)
    private Campeonato campeonato;

    // A CORREÇÃO ESTÁ AQUI: Removemos o 'nullable = false'
    @ManyToOne
    @JoinColumn(name = "grupo_grid_id")
    @JsonIgnore
    private GrupoGrid grupoGrid;

    @JsonIgnore
    @OneToMany(mappedBy = "bateria", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResultadoBateria> resultados;

    // ==========================================
    // GETTERS E SETTERS
    // ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public Campeonato getCampeonato() {
        return campeonato;
    }

    public void setCampeonato(Campeonato campeonato) {
        this.campeonato = campeonato;
    }

    public GrupoGrid getGrupoGrid() {
        return grupoGrid;
    }

    public void setGrupoGrid(GrupoGrid grupoGrid) {
        this.grupoGrid = grupoGrid;
    }

    public List<ResultadoBateria> getResultados() {
        return resultados;
    }

    public void setResultados(List<ResultadoBateria> resultados) {
        this.resultados = resultados;
    }
}