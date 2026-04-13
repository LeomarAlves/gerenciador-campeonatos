package com.leomar.gerenciador_campeonatos.repository;

import com.leomar.gerenciador_campeonatos.model.TabelaPontuacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TabelaPontuacaoRepository extends JpaRepository<TabelaPontuacao, Long> {
}