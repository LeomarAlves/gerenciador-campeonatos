package com.leomar.gerenciador_campeonatos.model;

import jakarta.persistence.*;

@Entity
public class ResultadoBateria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vários resultados pertencem a uma mesma Bateria
    @ManyToOne
    @JoinColumn(name = "bateria_id")
    private Bateria bateria;

    // Um Piloto pode ter vários resultados (um em cada bateria diferente)
    @ManyToOne
    @JoinColumn(name = "piloto_id")
    private Piloto piloto;

    private Integer posicaoChegada;

    private Integer pontos;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getPosicaoChegada() {
        return posicaoChegada;
    }

    public void setPosicaoChegada(Integer posicaoChegada) {
        this.posicaoChegada = posicaoChegada;
    }

    public Piloto getPiloto() {
        return piloto;
    }

    public void setPiloto(Piloto piloto) {
        this.piloto = piloto;
    }

    public Bateria getBateria() {
        return bateria;
    }

    public void setBateria(Bateria bateria) {
        this.bateria = bateria;
    }

    public Integer getPontos() {
        return pontos;
    }

    public void setPontos(Integer pontos) {
        this.pontos = pontos;
    }
}