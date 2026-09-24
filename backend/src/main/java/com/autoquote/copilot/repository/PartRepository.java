package com.autoquote.copilot.repository;

import com.autoquote.copilot.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartRepository extends JpaRepository<Part, Long> {
}
