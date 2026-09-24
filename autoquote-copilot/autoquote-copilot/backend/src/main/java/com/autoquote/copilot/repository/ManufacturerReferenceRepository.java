package com.autoquote.copilot.repository;

import com.autoquote.copilot.model.ManufacturerReference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManufacturerReferenceRepository extends JpaRepository<ManufacturerReference, Long> {
    List<ManufacturerReference> findByParteId(Long parteId);
}
