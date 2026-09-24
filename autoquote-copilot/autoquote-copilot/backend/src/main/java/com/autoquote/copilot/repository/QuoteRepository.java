package com.autoquote.copilot.repository;

import com.autoquote.copilot.model.Quote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
}
