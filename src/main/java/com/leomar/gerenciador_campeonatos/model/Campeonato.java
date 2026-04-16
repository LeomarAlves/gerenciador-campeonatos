package com.leomar.gerenciador_campeonatos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Campeonato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @JsonIgnore
    @OneToMany(mappedBy = "campeonato", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Categoria> categorias;

    @JsonIgnore
    @OneToMany(mappedBy = "campeonato", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bateria> baterias;

    @JsonIgnore
    @OneToMany(mappedBy = "campeonato", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GrupoGrid> grupoGrids;

    @JsonIgnore
    @OneToMany(mappedBy = "campeonato", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AjustePenalizacao> ajustesPenalizacao;


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

    public List<Categoria> getCategorias() {
        return categorias;
    }

    public void setCategorias(List<Categoria> categorias) {
        this.categorias = categorias;
    }

    public List<Bateria> getBaterias() {
        return baterias;
    }

    public void setBaterias(List<Bateria> baterias) {
        this.baterias = baterias;
    }

    public List<GrupoGrid> getGrupoGrids() {
        return grupoGrids;
    }

    public void setGrupoGrids(List<GrupoGrid> grupoGrids) {
        this.grupoGrids = grupoGrids;
    }

    public List<AjustePenalizacao> getAjustesPenalizacao() {
        return ajustesPenalizacao;
    }

    public void setAjustesPenalizacao(List<AjustePenalizacao> ajustesPenalizacao) {
        this.ajustesPenalizacao = ajustesPenalizacao;
    }
}