package com.nexus.pdverp.controller;

import com.nexus.pdverp.entity.Product;
import com.nexus.pdverp.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Produtos & Estoque", description = "Endpoints para catálogo de produtos, preços, tributos fiscais e saldos")
public class ProductController {

    private final ProductRepository productRepository;

    @GetMapping
    @Operation(summary = "Listar produtos ativos")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/barcode/{barcode}")
    @Operation(summary = "Consultar produto por código de barras EAN-13 (Leitor PDV)")
    public ResponseEntity<Product> getByBarcode(@PathVariable String barcode) {
        return productRepository.findByBarcode(barcode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Cadastrar novo produto")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product saved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
