package com.leomar.gerenciador_campeonatos.repository;

import com.leomar.gerenciador_campeonatos.model.Categoria;
import com.leomar.gerenciador_campeonatos.model.Piloto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PilotoRepository extends JpaRepository<Piloto, Long> {
    List<Piloto> findByCategoriaIn(List<Categoria> categorias);
}