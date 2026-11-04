-- =========================================================================
-- V1__init_schema.sql - NEXUS PDV & ERP COMERCIAL
-- PostgreSQL 16 Normalized Database Schema
-- =========================================================================

-- 1. TABELA DE USUÁRIOS & CONTROLE DE ACESSO
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN, GERENTE, OPERADOR_CAIXA, ESTOQUISTA
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 2. CATEGORIAS DE MERCADORIAS
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. MARCAS / FABRICANTES
CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CADASTRO DE PRODUTOS
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    category_id BIGINT REFERENCES categories(id),
    brand_id BIGINT REFERENCES brands(id),
    cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    margin_percent NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(10) NOT NULL DEFAULT 'UN',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    ncm VARCHAR(20) NOT NULL,
    cfop VARCHAR(10) NOT NULL,
    cst_csosn VARCHAR(10) NOT NULL,
    icms_aliquota NUMERIC(5, 2) DEFAULT 0.00,
    pis_aliquota NUMERIC(5, 2) DEFAULT 0.00,
    cofins_aliquota NUMERIC(5, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_sku ON products(sku);

-- 5. MOVIMENTAÇÕES DE ESTOQUE (RASTREAMENTO COMPLETO)
CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    type VARCHAR(30) NOT NULL, -- ENTRADA, SAIDA, AJUSTE, PERDA_AVARIA, TRANSFERENCIA
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    total_value NUMERIC(15, 2) NOT NULL,
    reason TEXT NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);

-- 6. GESTÃO DE TERMINAIS & CAIXAS
CREATE TABLE cash_registers (
    id BIGSERIAL PRIMARY KEY,
    terminal_number INTEGER NOT NULL,
    operator_id BIGINT NOT NULL REFERENCES users(id),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_sangria NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_suprimento NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO', -- ABERTO, FECHADO
    closing_notes TEXT
);

-- 7. MOVIMENTAÇÕES DE CAIXA (SANGRIA / SUPRIMENTO)
CREATE TABLE cash_movements (
    id BIGSERIAL PRIMARY KEY,
    cash_register_id BIGINT NOT NULL REFERENCES cash_registers(id),
    type VARCHAR(30) NOT NULL, -- SUPRIMENTO, SANGRIA, VENDA, CANCELAMENTO
    amount NUMERIC(15, 2) NOT NULL,
    reason TEXT NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CLIENTES
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    cpf_cnpj VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    phone VARCHAR(30),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    credit_limit NUMERIC(15, 2) DEFAULT 0.00,
    credit_used NUMERIC(15, 2) DEFAULT 0.00,
    total_purchases NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. FORNECEDORES
CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    corporate_name VARCHAR(150) NOT NULL,
    trade_name VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    contact_person VARCHAR(100),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. VENDAS (PDV)
CREATE TABLE sales (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    cash_register_id BIGINT NOT NULL REFERENCES cash_registers(id),
    operator_id BIGINT NOT NULL REFERENCES users(id),
    customer_id BIGINT REFERENCES customers(id),
    customer_name VARCHAR(150),
    customer_cpf_cnpj VARCHAR(20),
    subtotal NUMERIC(15, 2) NOT NULL,
    discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    addition_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL,
    change NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'CONCLUIDA', -- CONCLUIDA, CANCELADA, PENDENTE
    fiscal_key VARCHAR(44),
    invoice_number VARCHAR(20),
    cancelled_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. ITENS DA VENDA
CREATE TABLE sale_items (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL
);

-- 12. PAGAMENTOS DA VENDA
CREATE TABLE sale_payments (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    method VARCHAR(30) NOT NULL, -- DINHEIRO, PIX, CARTAO_CREDITO, CARTAO_DEBITO, CREDIARIO
    amount NUMERIC(15, 2) NOT NULL,
    installments INTEGER DEFAULT 1,
    tef_nsu VARCHAR(50),
    tef_auth_code VARCHAR(50),
    tef_acquirer VARCHAR(50)
);

-- 13. NOTAS FISCAIS ELETRÔNICAS (NFC-E & NF-E)
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT UNIQUE REFERENCES sales(id),
    invoice_number VARCHAR(20) NOT NULL,
    series VARCHAR(10) NOT NULL DEFAULT '1',
    model VARCHAR(10) NOT NULL DEFAULT '65', -- 65 = NFC-e, 55 = NF-e
    access_key VARCHAR(44) UNIQUE NOT NULL,
    environment VARCHAR(20) NOT NULL DEFAULT 'HOMOLOGACAO',
    protocol VARCHAR(50) NOT NULL,
    emission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'AUTORIZADA',
    digest_value VARCHAR(100),
    total_amount NUMERIC(15, 2) NOT NULL,
    xml_content TEXT,
    qr_code_url TEXT
);

-- 14. CONTAS A PAGAR
CREATE TABLE accounts_payable (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT REFERENCES suppliers(id),
    supplier_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', -- PENDENTE, PAGO, VENCIDO, CANCELADO
    payment_method VARCHAR(50),
    notes TEXT
);

-- 15. CONTAS A RECEBER
CREATE TABLE accounts_receivable (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    customer_name VARCHAR(150) NOT NULL,
    sale_id BIGINT REFERENCES sales(id),
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    received_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    installment VARCHAR(10) DEFAULT '1/1'
);

-- 16. AUDITORIA & REGISTRO DE ATIVIDADES
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
