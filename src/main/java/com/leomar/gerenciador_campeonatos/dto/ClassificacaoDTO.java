package com.leomar.gerenciador_campeonatos.dto;

import com.leomar.gerenciador_campeonatos.model.Piloto;

public class ClassificacaoDTO {
    private Piloto piloto;
    private Integer totalPontos;

    public ClassificacaoDTO(Piloto piloto, Integer totalPontos) {
        this.piloto = piloto;
        this.totalPontos = totalPontos;
    }

    public Piloto getPiloto() { return piloto; }
    public void setPiloto(Piloto piloto) { this.piloto = piloto; }

    public Integer getTotalPontos() { return totalPontos; }
    public void setTotalPontos(Integer totalPontos) { this.totalPontos = totalPontos; }
}