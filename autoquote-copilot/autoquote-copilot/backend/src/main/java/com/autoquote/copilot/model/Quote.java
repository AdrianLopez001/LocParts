package com.autoquote.copilot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Orcamento consolidado gerado pelo agente (mock) para uma placa/lista de itens.
 */
@Entity
@Table(name = "orcamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String placa;

    @Column(nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    /** Contexto textual estruturado que seria enviado ao agente de IA. */
    @Lob
    private String contextoGerado;

    @OneToMany(mappedBy = "orcamento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuoteItem> itens = new ArrayList<>();

    public void adicionarItem(QuoteItem item) {
        item.setOrcamento(this);
        this.itens.add(item);
    }
}
