package com.autoquote.copilot.repository;

import com.autoquote.copilot.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByPlacaIgnoreCase(String placa);
}
