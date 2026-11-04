package com.nexus.pdverp.controller;

import com.nexus.pdverp.entity.Sale;
import com.nexus.pdverp.repository.SaleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
@Tag(name = "Vendas PDV", description = "Endpoints para registro, conciliação e cancelamento de vendas no Ponto de Venda")
public class SaleController {

    private final SaleRepository saleRepository;

    @GetMapping
    @Operation(summary = "Listar todas as vendas", description = "Retorna histórico completo de vendas realizadas nos caixas")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    public ResponseEntity<List<Sale>> listSales() {
        return ResponseEntity.ok(saleRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar venda por ID")
    public ResponseEntity<Sale> getSaleById(@PathVariable Long id) {
        return saleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
