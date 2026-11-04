package com.nexus.pdverp.service;

import com.nexus.pdverp.entity.Sale;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
public class FiscalService {

    /**
     * Gera chave de acesso SEFAZ padrão de 44 dígitos com dígito verificador Módulo 11.
     */
    public String generateFiscalAccessKey(Sale sale) {
        String cUF = "35"; // São Paulo
        String aamm = sale.getCreatedAt().format(DateTimeFormatter.ofPattern("yyMM"));
        String cnpj = "12345678000190";
        String mod = "65"; // NFC-e
        String serie = "001";
        String nNF = String.format("%09d", sale.getId());
        String tpEmis = "1"; // Normal
        String cNF = String.format("%08d", new Random().nextInt(99999999));

        String rawKey = cUF + aamm + cnpj + mod + serie + nNF + tpEmis + cNF;

        // Cálculo do dígito verificador Módulo 11
        int weight = 2;
        int sum = 0;
        for (int i = rawKey.length() - 1; i >= 0; i--) {
            sum += Character.getNumericValue(rawKey.charAt(i)) * weight;
            weight = (weight == 9) ? 2 : weight + 1;
        }

        int remainder = sum % 11;
        int dv = (remainder == 0 || remainder == 1) ? 0 : 11 - remainder;

        return rawKey + dv;
    }
}
