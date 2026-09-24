package com.autoquote.copilot.service;

import com.autoquote.copilot.exception.VehicleNotFoundException;
import com.autoquote.copilot.model.Vehicle;
import com.autoquote.copilot.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Em producao este servico chamaria uma API externa de consulta veicular por
 * placa. Nesta PoC, a "consulta" e feita contra a tabela `veiculos`, populada
 * com dados sinteticos em data.sql - mantendo a mesma interface que teria
 * uma integracao real.
 */
@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public Vehicle buscarPorPlaca(String placa) {
        String placaNormalizada = placa.trim().toUpperCase();
        return vehicleRepository.findByPlacaIgnoreCase(placaNormalizada)
                .orElseThrow(() -> new VehicleNotFoundException(placaNormalizada));
    }
}
