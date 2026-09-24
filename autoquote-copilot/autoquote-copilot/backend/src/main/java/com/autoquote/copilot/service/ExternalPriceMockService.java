package com.autoquote.copilot.service;

import com.autoquote.copilot.model.ManufacturerReference;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Random;

/**
 * Simula a etapa de "cotacao em sites externos de autopecas".
 * No sistema original essa etapa e feita pelo agente (Claude Code) navegando
 * em sites parceiros reais; aqui os precos e fornecedores sao gerados de
 * forma pseudo-aleatoria porem plausivel, so para fins de demonstracao.
 */
@Service
public class ExternalPriceMockService {

    private static final List<String> FORNECEDORES_MOCK = List.of(
            "AutoPecas Norte", "PecasJá", "CentralAuto Distribuidora", "Reposição Rápida"
    );

    private final Random random = new Random();

    public CotacaoMock cotar(ManufacturerReference referencia) {
        BigDecimal base = referencia.getTipo() == ManufacturerReference.TipoReferencia.OEM
                ? faixa(320, 780)
                : faixa(140, 420);

        String fornecedor = FORNECEDORES_MOCK.get(random.nextInt(FORNECEDORES_MOCK.size()));
        return new CotacaoMock(fornecedor, base);
    }

    private BigDecimal faixa(int min, int max) {
        double valor = min + (max - min) * random.nextDouble();
        return BigDecimal.valueOf(valor).setScale(2, RoundingMode.HALF_UP);
    }

    public record CotacaoMock(String fornecedor, BigDecimal preco) {
    }
}
