package com.autoquote.copilot.dto;

import java.math.BigDecimal;
import java.util.List;

public record QuoteResponse(
        Long orcamentoId,
        VeiculoResumo veiculo,
        String contextoGerado,
        List<ItemResposta> itens,
        BigDecimal total
) {
    public record VeiculoResumo(
            String placa,
            String marca,
            String modelo,
            Integer ano,
            String motorizacao
    ) {
    }

    public record ItemResposta(
            String descricaoSolicitada,
            boolean encontrado,
            String pecaNomeGenerico,
            String referenciaOem,
            String referenciaFabricante,
            String fabricante,
            String fornecedorCotado,
            BigDecimal preco
    ) {
    }
}
