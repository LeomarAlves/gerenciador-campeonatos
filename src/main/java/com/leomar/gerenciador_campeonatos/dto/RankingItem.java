package com.leomar.gerenciador_campeonatos.dto;

import com.leomar.gerenciador_campeonatos.model.Piloto;

import java.util.Map;

public class RankingItem {
    private Piloto piloto;
    private Map<Long, Integer> pontosPorBateria; // ID da Bateria -> Pontos
    private Integer totalPontos;
    private Integer pontosSegundaBateria; // Para o critério de desempate


}
