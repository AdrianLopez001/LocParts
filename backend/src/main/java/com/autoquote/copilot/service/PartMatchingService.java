package com.autoquote.copilot.service;

import com.autoquote.copilot.model.Compatibility;
import com.autoquote.copilot.model.ManufacturerReference;
import com.autoquote.copilot.model.Part;
import com.autoquote.copilot.model.Vehicle;
import com.autoquote.copilot.repository.CompatibilityRepository;
import com.autoquote.copilot.repository.ManufacturerReferenceRepository;
import com.autoquote.copilot.repository.PartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Resolve descricoes em linguagem livre (o que o consultor digita) para
 * pecas do catalogo e, em seguida, filtra as referencias de fabricante que
 * sao compativeis com o veiculo informado.
 *
 * O matching aqui e propositalmente simples (normalizacao + contains sobre
 * sinonimos) para deixar clara a logica sem depender de um modelo de IA.
 * No sistema original em producao essa etapa e reforcada por um agente de
 * IA que lida com ambiguidade; aqui ela e mockada/simulada.
 */
@Service
@RequiredArgsConstructor
public class PartMatchingService {

    private final PartRepository partRepository;
    private final ManufacturerReferenceRepository referenceRepository;
    private final CompatibilityRepository compatibilityRepository;

    public PartMatchResult resolver(Vehicle vehicle, String descricaoLivre) {
        String normalizado = normalizar(descricaoLivre);

        Part parteEncontrada = partRepository.findAll().stream()
                .filter(parte -> casaComSinonimos(parte, normalizado))
                .findFirst()
                .orElse(null);

        if (parteEncontrada == null) {
            return PartMatchResult.naoEncontrado(descricaoLivre);
        }

        List<ManufacturerReference> referenciasDaPeca =
                referenceRepository.findByParteId(parteEncontrada.getId());

        List<ManufacturerReference> compativeis = referenciasDaPeca.stream()
                .filter(referencia -> compativelComVeiculo(referencia, vehicle))
                .toList();

        return new PartMatchResult(descricaoLivre, !compativeis.isEmpty(), parteEncontrada, compativeis);
    }

    private boolean casaComSinonimos(Part parte, String descricaoNormalizada) {
        if (parte.getSinonimos() == null) {
            return false;
        }
        return Arrays.stream(parte.getSinonimos().split(";"))
                .map(this::normalizar)
                .anyMatch(sinonimo -> !sinonimo.isBlank() && descricaoNormalizada.contains(sinonimo));
    }

    private boolean compativelComVeiculo(ManufacturerReference referencia, Vehicle vehicle) {
        List<Compatibility> regras = compatibilityRepository.findByReferenciaId(referencia.getId());
        return regras.stream().anyMatch(regra ->
                regra.getMarca().equalsIgnoreCase(vehicle.getMarca())
                        && regra.getModelo().equalsIgnoreCase(vehicle.getModelo())
                        && vehicle.getAno() >= regra.getAnoInicio()
                        && vehicle.getAno() <= regra.getAnoFim()
                        && (regra.getMotorizacao() == null
                        || regra.getMotorizacao().equalsIgnoreCase(vehicle.getMotorizacao()))
        );
    }

    /** Remove acentos e caixa alta/baixa para tornar o matching mais tolerante. */
    private String normalizar(String texto) {
        String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return semAcento.toLowerCase(Locale.forLanguageTag("pt-BR")).trim();
    }
}
