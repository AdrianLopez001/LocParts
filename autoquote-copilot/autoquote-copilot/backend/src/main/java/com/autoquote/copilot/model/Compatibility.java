package com.autoquote.copilot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Define para quais veiculos (marca/modelo/faixa de ano/motorizacao) uma
 * determinada referencia de fabricante e compativel.
 * motorizacao = null significa "compativel com qualquer motorizacao".
 */
@Entity
@Table(name = "compatibilidade")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Compatibility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "referencia_id")
    private ManufacturerReference referencia;

    @Column(nullable = false)
    private String marca;

    @Column(nullable = false)
    private String modelo;

    @Column(nullable = false)
    private Integer anoInicio;

    @Column(nullable = false)
    private Integer anoFim;

    /** Nula = compativel com qualquer motorizacao do modelo/ano. */
    private String motorizacao;
}
