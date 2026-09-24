package com.autoquote.copilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Payload de entrada: placa do veiculo + lista de itens em linguagem livre,
 * exatamente como o consultor digitaria (ex: "disco de freio dianteiro").
 */
public record QuoteRequest(

        @NotBlank(message = "placa e obrigatoria")
        String placa,

        @NotEmpty(message = "informe ao menos um item")
        List<String> itens
) {
}
