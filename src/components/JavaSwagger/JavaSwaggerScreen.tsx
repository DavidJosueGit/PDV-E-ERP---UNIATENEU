import React, { useState } from 'react';
import {
  Code2,
  FileCode,
  Layers,
  Database,
  Container,
  BookOpen,
  Play,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { StorageService } from '../../services/storage';

export const JavaSwaggerScreen: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'SWAGGER' | 'JAVA_CODE' | 'DOCKER' | 'FLYWAY'>('SWAGGER');
  const [copied, setCopied] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('sales_create');
  const [endpointResponse, setEndpointResponse] = useState<string>('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteEndpoint = (endpointId: string) => {
    const db = StorageService.getDatabase();
    if (endpointId === 'sales_create') {
      const lastSale = db.sales[0];
      setEndpointResponse(JSON.stringify({
        status: 201,
        message: 'Venda criada com sucesso e estoque baixado via Spring Transaction',
        data: lastSale || { id: 'sale-mock', total: 45.70, status: 'CONCLUIDA' }
      }, null, 2));
    } else if (endpointId === 'products_list') {
      setEndpointResponse(JSON.stringify({
        status: 200,
        totalElements: db.products.length,
        content: db.products.slice(0, 3)
      }, null, 2));
    } else if (endpointId === 'fiscal_status') {
      setEndpointResponse(JSON.stringify({
        status: 200,
        sefazStatus: '107 - Serviço em Operação',
        ambiente: 'HOMOLOGACAO',
        versaoLayout: '4.00',
        timestamp: new Date().toISOString()
      }, null, 2));
    } else if (endpointId === 'cash_status') {
      const activeCash = StorageService.getActiveCashRegister();
      setEndpointResponse(JSON.stringify({
        status: 200,
        caixa: activeCash || { status: 'FECHADO', message: 'Nenhum terminal aberto' }
      }, null, 2));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-orange-400" />
            <span>Arquitetura Back-End Java 21 & OpenAPI (Swagger)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Projeto enterprise Spring Boot 3, Spring Data JPA, PostgreSQL, Flyway, Docker Compose e contratos RESTful.
          </p>
        </div>

        {/* Seletor de Modo */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveSection('SWAGGER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSection === 'SWAGGER'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Swagger UI / REST APIs
          </button>
          <button
            onClick={() => setActiveSection('JAVA_CODE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSection === 'JAVA_CODE'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fontes Java (Spring Boot)
          </button>
          <button
            onClick={() => setActiveSection('FLYWAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSection === 'FLYWAY'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Flyway SQL (PostgreSQL)
          </button>
          <button
            onClick={() => setActiveSection('DOCKER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSection === 'DOCKER'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Docker Compose
          </button>
        </div>
      </div>

      {/* Seção Swagger OpenAPI Interativo */}
      {activeSection === 'SWAGGER' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded font-mono font-bold border border-emerald-500/30">
                OAS 3.0.3
              </span>
              <div>
                <h3 className="font-bold text-white text-sm">Nexus PDV + ERP REST API Specifications</h3>
                <span className="text-[11px] text-slate-400">Base URL: <strong className="text-slate-300 font-mono">http://localhost:8080/api/v1</strong></span>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Autenticação: <span className="text-orange-400 font-mono">Bearer &lt;JWT&gt;</span>
            </div>
          </div>

          {/* Endpoints Lista */}
          <div className="space-y-3">
            {/* POST /api/v1/sales */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-850 flex items-center justify-between cursor-pointer" onClick={() => setSelectedEndpoint('sales_create')}>
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-600 text-white font-bold font-mono text-[11px] px-2.5 py-0.5 rounded">POST</span>
                  <span className="font-mono text-xs text-white font-semibold">/api/v1/sales</span>
                  <span className="text-xs text-slate-400">Registrar Venda PDV, baixar estoque e autorizar NFC-e</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecuteEndpoint('sales_create');
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Testar (Try it)</span>
                </button>
              </div>
              {selectedEndpoint === 'sales_create' && (
                <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs space-y-3 font-mono">
                  <div className="text-slate-400 text-[11px]">Request Body (application/json):</div>
                  <pre className="bg-slate-900 p-3 rounded text-slate-300 overflow-x-auto">
{`{
  "cashRegisterId": "cx-1",
  "items": [
    { "productId": "prod-1", "quantity": 2, "unitPrice": 11.90, "discount": 0 }
  ],
  "payments": [
    { "method": "PIX", "amount": 23.80 }
  ],
  "customerCpfCnpj": "123.456.789-00",
  "emitFiscalInvoice": true
}`}
                  </pre>
                </div>
              )}
            </div>

            {/* GET /api/v1/products */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-850 flex items-center justify-between cursor-pointer" onClick={() => setSelectedEndpoint('products_list')}>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white font-bold font-mono text-[11px] px-2.5 py-0.5 rounded">GET</span>
                  <span className="font-mono text-xs text-white font-semibold">/api/v1/products</span>
                  <span className="text-xs text-slate-400">Listagem paginada e consulta por código de barras / SKU</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecuteEndpoint('products_list');
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Testar (Try it)</span>
                </button>
              </div>
            </div>

            {/* GET /api/v1/fiscal/sefaz-status */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-850 flex items-center justify-between cursor-pointer" onClick={() => setSelectedEndpoint('fiscal_status')}>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white font-bold font-mono text-[11px] px-2.5 py-0.5 rounded">GET</span>
                  <span className="font-mono text-xs text-white font-semibold">/api/v1/fiscal/sefaz-status</span>
                  <span className="text-xs text-slate-400">Verificar status de homologação/produção dos servidores SEFAZ</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecuteEndpoint('fiscal_status');
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Testar (Try it)</span>
                </button>
              </div>
            </div>

            {/* GET /api/v1/cash-register/current */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-850 flex items-center justify-between cursor-pointer" onClick={() => setSelectedEndpoint('cash_status')}>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white font-bold font-mono text-[11px] px-2.5 py-0.5 rounded">GET</span>
                  <span className="font-mono text-xs text-white font-semibold">/api/v1/cash-register/current</span>
                  <span className="text-xs text-slate-400">Obter status atual do terminal de caixa e saldo apurado</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecuteEndpoint('cash_status');
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Testar (Try it)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Resposta do Teste ao Vivo */}
          {endpointResponse && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Resposta da Requisição HTTP (200 OK)
                </span>
                <button
                  onClick={() => copyToClipboard(endpointResponse)}
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar JSON</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 max-h-60">
                {endpointResponse}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Seção Código Java Spring Boot */}
      {activeSection === 'JAVA_CODE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-orange-400" />
              <h2 className="font-bold text-white text-sm">SaleService.java (Regra Transacional e Baixa de Estoque)</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">com.nexus.pdverp.service</span>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`package com.nexus.pdverp.service;

import com.nexus.pdverp.dto.SaleRequestDTO;
import com.nexus.pdverp.dto.SaleResponseDTO;
import com.nexus.pdverp.entity.*;
import com.nexus.pdverp.exception.BusinessException;
import com.nexus.pdverp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CashRegisterRepository cashRegisterRepository;
    private final StockMovementRepository stockMovementRepository;
    private final FiscalService fiscalService;

    @Transactional(isolation = Isolation.REPEATABLE_READ, rollbackFor = Exception.class)
    public SaleResponseDTO createSale(SaleRequestDTO dto, Long operatorId) {
        // 1. Validar caixa aberto
        CashRegister cash = cashRegisterRepository.findById(dto.getCashRegisterId())
                .orElseThrow(() -> new BusinessException("Caixa informado não encontrado"));
        
        if (cash.getStatus() != CashRegisterStatus.ABERTO) {
            throw new BusinessException("Operação negada: o caixa encontra-se fechado!");
        }

        Sale sale = new Sale();
        sale.setCashRegister(cash);
        sale.setOperatorId(operatorId);
        sale.setCreatedAt(LocalDateTime.now());
        sale.setStatus(SaleStatus.CONCLUIDA);

        BigDecimal subtotal = BigDecimal.ZERO;

        // 2. Processar itens e baixar estoque com trava de concorrência
        for (var itemDto : dto.getItems()) {
            Product product = productRepository.findByIdWithLock(itemDto.getProductId())
                    .orElseThrow(() -> new BusinessException("Produto " + itemDto.getProductId() + " não existe"));

            if (product.getCurrentStock() < itemDto.getQuantity()) {
                throw new BusinessException("Estoque insuficiente para o produto: " + product.getName());
            }

            // Baixa no estoque
            product.setCurrentStock(product.getCurrentStock() - itemDto.getQuantity());
            productRepository.save(product);

            // Registrar trilha de auditoria de movimentação
            StockMovement movement = new StockMovement();
            movement.setProduct(product);
            movement.setType(MovementType.SAIDA);
            movement.setQuantity(itemDto.getQuantity());
            movement.setReason("Venda PDV Terminal #" + cash.getTerminalNumber());
            stockMovementRepository.save(movement);

            BigDecimal itemTotal = product.getSalePrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        sale.setSubtotal(subtotal);
        sale.setTotal(subtotal.subtract(dto.getDiscountTotal() != null ? dto.getDiscountTotal() : BigDecimal.ZERO));
        saleRepository.save(sale);

        // 3. Emissão fiscal SEFAZ NFC-e
        if (Boolean.TRUE.equals(dto.getEmitFiscalInvoice())) {
            fiscalService.emitNfce(sale);
        }

        return new SaleResponseDTO(sale);
    }
}`}
          </pre>
        </div>
      )}

      {/* Seção Flyway SQL */}
      {activeSection === 'FLYWAY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-white text-sm">V1__initial_schema.sql (PostgreSQL 16)</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">src/main/resources/db/migration</span>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
{`-- V1__initial_schema.sql - Nexus PDV + ERP Comercial Schema
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN, GERENTE, OPERADOR_CAIXA, ESTOQUISTA
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20)
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    category_id BIGINT REFERENCES categories(id),
    cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(10) NOT NULL DEFAULT 'UN',
    ncm VARCHAR(20) NOT NULL,
    cfop VARCHAR(10) NOT NULL,
    cst_csosn VARCHAR(10) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cash_registers (
    id BIGSERIAL PRIMARY KEY,
    terminal_number INTEGER NOT NULL,
    operator_id BIGINT REFERENCES users(id),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO'
);

CREATE TABLE sales (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    cash_register_id BIGINT REFERENCES cash_registers(id),
    operator_id BIGINT REFERENCES users(id),
    subtotal NUMERIC(15, 2) NOT NULL,
    discount_total NUMERIC(15, 2) DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    fiscal_key VARCHAR(44),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}
          </pre>
        </div>
      )}

      {/* Seção Docker Compose */}
      {activeSection === 'DOCKER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Container className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-white text-sm">docker-compose.yml & Dockerfile (Java 21 + Postgres 16)</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Ambiente de Produção e Desenvolvimento</span>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`version: '3.8'

services:
  postgres-db:
    image: postgres:16-alpine
    container_name: nexus-postgres-db
    environment:
      POSTGRES_DB: nexus_pdv_erp
      POSTGRES_USER: nexus_admin
      POSTGRES_PASSWORD: SecretPassword123!
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nexus_admin -d nexus_pdv_erp"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend-app:
    build:
      context: ./backend-java
      dockerfile: Dockerfile
    container_name: nexus-spring-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres-db:5432/nexus_pdv_erp
      SPRING_DATASOURCE_USERNAME: nexus_admin
      SPRING_DATASOURCE_PASSWORD: SecretPassword123!
      JWT_SECRET: 9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f
    depends_on:
      postgres-db:
        condition: service_healthy

volumes:
  pgdata:`}
          </pre>
        </div>
      )}
    </div>
  );
};
