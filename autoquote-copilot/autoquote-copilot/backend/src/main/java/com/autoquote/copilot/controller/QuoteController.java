package com.autoquote.copilot.controller;

import com.autoquote.copilot.dto.QuoteRequest;
import com.autoquote.copilot.dto.QuoteResponse;
import com.autoquote.copilot.service.MockAiAgentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orcamentos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuoteController {

    private final MockAiAgentService mockAiAgentService;

    /**
     * Recebe placa + itens em linguagem livre e devolve o orcamento
     * consolidado, incluindo o contexto que seria enviado ao agente de IA.
     */
    @PostMapping
    public ResponseEntity<QuoteResponse> gerarOrcamento(@Valid @RequestBody QuoteRequest request) {
        return ResponseEntity.ok(mockAiAgentService.gerarOrcamento(request));
    }
}
