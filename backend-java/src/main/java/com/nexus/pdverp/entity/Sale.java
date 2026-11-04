package com.nexus.pdverp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
@Getter
@Setter
@NoArgsConstructor
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "cash_register_id", nullable = false)
    private Long cashRegisterId;

    @Column(name = "operator_id", nullable = false)
    private Long operatorId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_cpf_cnpj")
    private String customerCpfCnpj;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(name = "discount_total", precision = 15, scale = 2)
    private BigDecimal discountTotal = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal total;

    @Column(precision = 15, scale = 2)
    private BigDecimal change = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    private String status = "CONCLUIDA";

    @Column(name = "fiscal_key", length = 44)
    private String fiscalKey;

    @Column(name = "invoice_number", length = 20)
    private String invoiceNumber;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();
}
