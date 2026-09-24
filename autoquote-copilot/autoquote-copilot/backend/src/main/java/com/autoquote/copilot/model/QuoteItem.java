package com.autoquote.copilot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Um item resolvido dentro de um orcamento: o texto original digitado pelo
 * consultor, a peca/referencia encontrada e o preco mockado da "cotacao externa".
 */
@Entity
@Table(name = "orcamento_itens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "orcamento_id")
    private Quote orcamento;

    @Column(nullable = false)
    private String descricaoSolicitada;

    private Boolean encontrado = false;

    private String pecaNomeGenerico;

    private String referenciaOem;

    private String referenciaFabricante;

    private String fabricante;

    private String fornecedorCotado;

    private BigDecimal preco = BigDecimal.ZERO;
}
