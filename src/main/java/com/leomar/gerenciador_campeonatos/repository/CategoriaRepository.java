package com.leomar.gerenciador_campeonatos.repository;

import com.leomar.gerenciador_campeonatos.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    // O Spring é tão inteligente que só de ler este nome em inglês,
    // ele já sabe criar o comando SQL (SELECT * FROM categoria WHERE campeonato_id = ?)
    List<Categoria> findByCampeonatoId(Long campeonatoId);

}