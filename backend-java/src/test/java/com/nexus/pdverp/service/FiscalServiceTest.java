package com.nexus.pdverp.service;

import com.nexus.pdverp.entity.Sale;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class FiscalServiceTest {

    private final FiscalService fiscalService = new FiscalService();

    @Test
    @DisplayName("Deve gerar chave de acesso SEFAZ válida com exatamente 44 dígitos")
    void shouldGenerateValid44DigitAccessKey() {
        Sale sale = new Sale();
        sale.setId(101L);
        sale.setCreatedAt(LocalDateTime.of(2025, 2, 3, 11, 24));

        String key = fiscalService.generateFiscalAccessKey(sale);

        assertNotNull(key);
        assertEquals(44, key.length(), "A chave de acesso SEFAZ deve ter exatamente 44 dígitos numéricos");
        assertTrue(key.matches("\\d{44}"), "A chave deve conter apenas dígitos numéricos");
        assertTrue(key.startsWith("35"), "Código da UF São Paulo deve ser 35");
    }
}
