package com.leomar.gerenciador_campeonatos.repository;

import com.leomar.gerenciador_campeonatos.model.Bateria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BateriaRepository extends JpaRepository<Bateria, Long> {
    List<Bateria> findByCampeonatoId(Long campeonatoId);
}