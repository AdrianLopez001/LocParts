package com.autoquote.copilot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Referencia cruzada (cross-reference) de uma peca: pode ser o codigo
 * original de montadora (OEM) ou de um fabricante de reposicao (Aftermarket).
 */
@Entity
@Table(name = "referencias_fabricante")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManufacturerReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "peca_id")
    private Part parte;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoReferencia tipo;

    @Column(nullable = false)
    private String fabricante;

    @Column(nullable = false)
    private String codigo;

    public enum TipoReferencia {
        OEM,
        AFTERMARKET
    }
}
