package com.leomar.gerenciador_campeonatos.model;

import jakarta.persistence.*;

@Entity
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    // A MÁGICA ACONTECE AQUI: Ligando a Categoria ao Campeonato
    @ManyToOne
    @JoinColumn(name = "campeonato_id", nullable = false)
    private Campeonato campeonato;

    @ManyToOne
    @JoinColumn(name = "tabela_pontuacao_id")
    private TabelaPontuacao tabelaPontuacao;

    // --- GETTERS E SETTERS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Campeonato getCampeonato() {
        return campeonato;
    }

    public void setCampeonato(Campeonato campeonato) {
        this.campeonato = campeonato;
    }

    public TabelaPontuacao getTabelaPontuacao() {
        return tabelaPontuacao;
    }

    public void setTabelaPontuacao(TabelaPontuacao tabelaPontuacao) {
        this.tabelaPontuacao = tabelaPontuacao;
    }
}
