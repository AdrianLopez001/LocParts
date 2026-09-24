package com.autoquote.copilot.controller;

import com.autoquote.copilot.model.Part;
import com.autoquote.copilot.model.Vehicle;
import com.autoquote.copilot.repository.PartRepository;
import com.autoquote.copilot.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Endpoints auxiliares apenas para navegar/inspecionar os dados mockados
 * (uteis para testar a PoC sem precisar acessar o banco diretamente).
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CatalogController {

    private final VehicleRepository vehicleRepository;
    private final PartRepository partRepository;

    @GetMapping("/veiculos")
    public List<Vehicle> listarVeiculos() {
        return vehicleRepository.findAll();
    }

    @GetMapping("/pecas")
    public List<Part> listarPecas() {
        return partRepository.findAll();
    }
}
