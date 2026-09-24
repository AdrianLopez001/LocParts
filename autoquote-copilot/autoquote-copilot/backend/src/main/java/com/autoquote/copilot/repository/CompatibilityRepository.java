package com.autoquote.copilot.repository;

import com.autoquote.copilot.model.Compatibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompatibilityRepository extends JpaRepository<Compatibility, Long> {
    List<Compatibility> findByReferenciaId(Long referenciaId);
}
