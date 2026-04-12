package com.leomar.gerenciador_campeonatos.repository;

import com.leomar.gerenciador_campeonatos.model.Campeonato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// A anotação @Repository é opcional aqui, mas é uma boa prática visual
@Repository
public interface CampeonatoRepository extends JpaRepository<Campeonato, Long> {

    // O JpaRepository exige dois parâmetros no < >:
    // 1. A Classe que ele vai gerenciar (Campeonato)
    // 2. O tipo de dado da Chave Primária (@Id) dessa classe (Long)

}