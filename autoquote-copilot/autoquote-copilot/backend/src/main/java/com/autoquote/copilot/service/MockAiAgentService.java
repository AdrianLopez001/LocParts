package com.autoquote.copilot.service;

import com.autoquote.copilot.dto.QuoteRequest;
import com.autoquote.copilot.dto.QuoteResponse;
import com.autoquote.copilot.model.ManufacturerReference;
import com.autoquote.copilot.model.Quote;
import com.autoquote.copilot.model.QuoteItem;
import com.autoquote.copilot.model.Vehicle;
import com.autoquote.copilot.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Reproduz, de forma simulada, o papel que na versao real do sistema e
 * desempenhado por um agente de IA (Claude Code): recebe o contexto ja
 * estruturado (placa + itens resolvidos), "decide" quais referencias usar
 * e monta o orcamento final.
 *
 * Nenhuma chamada a uma API de IA e feita aqui - a decisao (preferir
 * Aftermarket, cair para OEM se nao houver alternativa) e uma regra fixa,
 * exatamente para que o projeto rode sem custo/API key externa.
 */
@Service
@RequiredArgsConstructor
public class MockAiAgentService {

    private final VehicleService vehicleService;
    private final PartMatchingService partMatchingService;
    private final ExternalPriceMockService priceMockService;
    private final QuoteRepository quoteRepository;

    @Transactional
    public QuoteResponse gerarOrcamento(QuoteRequest request) {
        Vehicle vehicle = vehicleService.buscarPorPlaca(request.placa());

        List<PartMatchResult> resolvidos = request.itens().stream()
                .map(item -> partMatchingService.resolver(vehicle, item))
                .toList();

        Quote orcamento = new Quote();
        orcamento.setPlaca(vehicle.getPlaca());
        orcamento.setContextoGerado(construirContexto(vehicle, resolvidos));

        BigDecimal total = BigDecimal.ZERO;
        for (PartMatchResult resultado : resolvidos) {
            QuoteItem item = new QuoteItem();
            item.setDescricaoSolicitada(resultado.descricaoSolicitada());
            item.setEncontrado(resultado.encontrado());

            if (resultado.encontrado()) {
                item.setPecaNomeGenerico(resultado.parte().getNomeGenerico());
                preencherReferencias(item, resultado.referenciasCompativeis());

                ManufacturerReference referenciaParaCotar = escolherReferenciaParaCotar(resultado.referenciasCompativeis());
                var cotacao = priceMockService.cotar(referenciaParaCotar);
                item.setFornecedorCotado(cotacao.fornecedor());
                item.setPreco(cotacao.preco());
                total = total.add(cotacao.preco());
            }

            orcamento.adicionarItem(item);
        }
        orcamento.setTotal(total);

        Quote salvo = quoteRepository.save(orcamento);
        return paraResponse(vehicle, salvo);
    }

    /** Prioriza Aftermarket (mais barato) para cotar; cai para OEM se for a unica opcao. */
    private ManufacturerReference escolherReferenciaParaCotar(List<ManufacturerReference> referencias) {
        return referencias.stream()
                .filter(r -> r.getTipo() == ManufacturerReference.TipoReferencia.AFTERMARKET)
                .findFirst()
                .orElse(referencias.get(0));
    }

    private void preencherReferencias(QuoteItem item, List<ManufacturerReference> referencias) {
        Optional<ManufacturerReference> oem = referencias.stream()
                .filter(r -> r.getTipo() == ManufacturerReference.TipoReferencia.OEM)
                .findFirst();
        Optional<ManufacturerReference> aftermarket = referencias.stream()
                .filter(r -> r.getTipo() == ManufacturerReference.TipoReferencia.AFTERMARKET)
                .findFirst();

        oem.ifPresent(r -> item.setReferenciaOem(r.getCodigo()));
        aftermarket.ifPresent(r -> {
            item.setReferenciaFabricante(r.getCodigo());
            item.setFabricante(r.getFabricante());
        });
        if (aftermarket.isEmpty()) {
            oem.ifPresent(r -> item.setFabricante(r.getFabricante()));
        }
    }

    /**
     * Monta o texto corrido e determinístico que, no sistema real, seria
     * enviado como contexto para o agente de IA executar a cotacao/cadastro.
     */
    private String construirContexto(Vehicle vehicle, List<PartMatchResult> resolvidos) {
        StringBuilder sb = new StringBuilder();
        sb.append("Veiculo: ").append(vehicle.getMarca()).append(' ').append(vehicle.getModelo())
                .append(" ").append(vehicle.getAno()).append(" ").append(vehicle.getMotorizacao())
                .append(" (placa ").append(vehicle.getPlaca()).append(")\n");

        int indice = 1;
        for (PartMatchResult resultado : resolvidos) {
            if (!resultado.encontrado()) {
                sb.append("Item ").append(indice++).append(": \"").append(resultado.descricaoSolicitada())
                        .append("\" — nao encontrado no catalogo\n");
                continue;
            }
            String refsTexto = resultado.referenciasCompativeis().stream()
                    .map(r -> "Ref. " + r.getTipo() + " (" + r.getFabricante() + "): " + r.getCodigo())
                    .reduce((a, b) -> a + " | " + b)
                    .orElse("sem referencias compativeis");

            sb.append("Item ").append(indice++).append(": ").append(resultado.parte().getNomeGenerico())
                    .append(" — ").append(refsTexto).append('\n');
        }
        sb.append("Acao solicitada: montar orcamento e cotar os itens acima em fornecedores parceiros.");
        return sb.toString();
    }

    private QuoteResponse paraResponse(Vehicle vehicle, Quote quote) {
        var veiculoResumo = new QuoteResponse.VeiculoResumo(
                vehicle.getPlaca(), vehicle.getMarca(), vehicle.getModelo(),
                vehicle.getAno(), vehicle.getMotorizacao());

        List<QuoteResponse.ItemResposta> itens = quote.getItens().stream()
                .map(item -> new QuoteResponse.ItemResposta(
                        item.getDescricaoSolicitada(),
                        item.getEncontrado(),
                        item.getPecaNomeGenerico(),
                        item.getReferenciaOem(),
                        item.getReferenciaFabricante(),
                        item.getFabricante(),
                        item.getFornecedorCotado(),
                        item.getPreco()
                ))
                .toList();

        return new QuoteResponse(quote.getId(), veiculoResumo, quote.getContextoGerado(), itens, quote.getTotal());
    }
}
