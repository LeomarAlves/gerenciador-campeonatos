package com.leomar.gerenciador_campeonatos.repository;

import com.leomar.gerenciador_campeonatos.model.ResultadoBateria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultadoBateriaRepository extends JpaRepository<ResultadoBateria, Long> {
    // O método que o nosso PontuacaoService usa!
    List<ResultadoBateria> findByBateriaIdOrderByPosicaoChegadaAsc(Long bateriaId);
}