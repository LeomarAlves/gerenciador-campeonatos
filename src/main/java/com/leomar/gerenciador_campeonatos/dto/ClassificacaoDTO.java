package com.leomar.gerenciador_campeonatos.dto;

import com.leomar.gerenciador_campeonatos.model.Piloto;
import java.util.LinkedHashMap;
import java.util.Map;

public class ClassificacaoDTO {
    private Piloto piloto;
    private Integer totalPontos;

    // Guarda o histórico: Ex: "Bateria 1" -> "25", "Bateria 2" -> "NC"
    private Map<String, String> resultadosPorBateria = new LinkedHashMap<>();

    // Construtor Vazio
    public ClassificacaoDTO() {}

    public Piloto getPiloto() { return piloto; }
    public void setPiloto(Piloto piloto) { this.piloto = piloto; }

    public Integer getTotalPontos() { return totalPontos; }
    public void setTotalPontos(Integer totalPontos) { this.totalPontos = totalPontos; }

    public Map<String, String> getResultadosPorBateria() { return resultadosPorBateria; }
    public void setResultadosPorBateria(Map<String, String> resultadosPorBateria) { this.resultadosPorBateria = resultadosPorBateria; }
}