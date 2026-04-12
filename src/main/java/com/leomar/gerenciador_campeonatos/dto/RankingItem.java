package com.leomar.gerenciador_campeonatos.dto;

import com.leomar.gerenciador_campeonatos.model.Piloto;

import java.util.Map;

public class RankingItem {
    private Piloto piloto;
    private Map<Long, Integer> pontosPorBateria; // ID da Bateria -> Pontos
    private Integer totalPontos;
    private Integer pontosSegundaBateria; // Para o critério de desempate

    public Piloto getPiloto() {
        return piloto;
    }

    public void setPiloto(Piloto piloto) {
        this.piloto = piloto;
    }

    public Integer getPontosSegundaBateria() {
        return pontosSegundaBateria;
    }

    public void setPontosSegundaBateria(Integer pontosSegundaBateria) {
        this.pontosSegundaBateria = pontosSegundaBateria;
    }

    public Integer getTotalPontos() {
        return totalPontos;
    }

    public void setTotalPontos(Integer totalPontos) {
        this.totalPontos = totalPontos;
    }

    public Map<Long, Integer> getPontosPorBateria() {
        return pontosPorBateria;
    }

    public void setPontosPorBateria(Map<Long, Integer> pontosPorBateria) {
        this.pontosPorBateria = pontosPorBateria;
    }
}
