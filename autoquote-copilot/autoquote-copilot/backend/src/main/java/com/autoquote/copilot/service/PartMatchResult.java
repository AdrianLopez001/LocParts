package com.autoquote.copilot.service;

import com.autoquote.copilot.model.ManufacturerReference;
import com.autoquote.copilot.model.Part;

import java.util.List;

/**
 * Resultado do cruzamento de um texto livre ("disco de freio dianteiro")
 * com o catalogo: a peca generica encontrada + as referencias de fabricante
 * compativeis com o veiculo consultado.
 */
public record PartMatchResult(
        String descricaoSolicitada,
        boolean encontrado,
        Part parte,
        List<ManufacturerReference> referenciasCompativeis
) {

    public static PartMatchResult naoEncontrado(String descricaoSolicitada) {
        return new PartMatchResult(descricaoSolicitada, false, null, List.of());
    }
}
