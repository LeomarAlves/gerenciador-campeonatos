package com.leomar.gerenciador_campeonatos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Piloto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private Integer numeroKart;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @JsonIgnore
    @OneToMany(mappedBy = "piloto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResultadoBateria> resultados;

    @JsonIgnore
    @OneToMany(mappedBy = "piloto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AjustePenalizacao> ajustesPenalizacao;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Integer getNumeroKart() {
        return numeroKart;
    }

    public void setNumeroKart(Integer numeroKart) {
        this.numeroKart = numeroKart;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public List<ResultadoBateria> getResultados() {
        return resultados;
    }

    public void setResultados(List<ResultadoBateria> resultados) {
        this.resultados = resultados;
    }

    public List<AjustePenalizacao> getAjustesPenalizacao() {
        return ajustesPenalizacao;
    }

    public void setAjustesPenalizacao(List<AjustePenalizacao> ajustesPenalizacao) {
        this.ajustesPenalizacao = ajustesPenalizacao;
    }
}
