package com.autoquote.copilot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Cadastro mestre de uma peca generica (ex: "disco de freio dianteiro").
 * O campo `sinonimos` guarda variacoes de texto que consultores costumam
 * digitar, usadas pelo PartMatchingService para o "match" por linguagem natural.
 */
@Entity
@Table(name = "pecas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeGenerico;

    @Column(nullable = false)
    private String categoria;

    /** Termos separados por ";" usados para matching por texto livre. */
    @Column(length = 500)
    private String sinonimos;
}
