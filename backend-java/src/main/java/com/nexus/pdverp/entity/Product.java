package com.nexus.pdverp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String sku;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String barcode;

    @NotNull
    @Column(name = "cost_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal costPrice;

    @NotNull
    @Column(name = "sale_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal salePrice;

    @Column(name = "margin_percent", precision = 8, scale = 2)
    private BigDecimal marginPercent;

    @NotNull
    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @NotNull
    @Column(name = "min_stock", nullable = false)
    private Integer minStock;

    @Column(length = 10, nullable = false)
    private String unit = "UN";

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private String ncm;

    @Column(nullable = false)
    private String cfop;

    @Column(name = "cst_csosn", nullable = false)
    private String cstCsosn;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
