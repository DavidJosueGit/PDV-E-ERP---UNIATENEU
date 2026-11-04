package com.nexus.pdverp.repository;

import com.nexus.pdverp.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByCode(String code);

    Optional<Sale> findByFiscalKey(String fiscalKey);
}
