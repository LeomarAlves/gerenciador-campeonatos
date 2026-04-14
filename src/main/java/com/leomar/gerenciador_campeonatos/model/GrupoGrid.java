package com.leomar.gerenciador_campeonatos.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class GrupoGrid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; // Ex: "Grid F4 Mista", "Grid Cadete"

    @ManyToOne
    @JoinColumn(name = "campeonato_id")
    private Campeonato campeonato;

    // Um Grid pode ter várias categorias correndo juntas
    @OneToMany(mappedBy = "grupoGrid")
    private List<Categoria> categorias;

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

    public Campeonato getCampeonato() {
        return campeonato;
    }

    public void setCampeonato(Campeonato campeonato) {
        this.campeonato = campeonato;
    }

    public List<Categoria> getCategorias() {
        return categorias;
    }

    public void setCategorias(List<Categoria> categorias) {
        this.categorias = categorias;
    }
}