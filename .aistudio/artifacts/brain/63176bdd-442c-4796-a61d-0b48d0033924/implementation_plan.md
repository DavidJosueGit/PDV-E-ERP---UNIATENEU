# Plano de Implementação — Impressão de Cupons Fiscais & Arquitetura Completa de Banco de Dados PostgreSQL (PDV + ERP)

Plano arquitetural e operacional para integrar a impressão flexível de cupons fiscais (NFC-e térmica 80mm e DANFE A4) e fornecer a modelagem e engenharia completa do banco de dados relacional PostgreSQL 16 para controle de estoque e ERP, pronto para Spring Boot 3 e Docker.

---

### Decisões do Usuário & Alinhamentos Críticos

> [!IMPORTANT]
> As decisões de arquitetura e experiência de usuário foram confirmadas na fase de entrevista:
> - **Isolamento Multi-Empresa e Filiais**: Implementado através de colunas estruturadas `tenant_id` e `company_id` em todas as tabelas transacionais, com políticas ativas de **Row-Level Security (RLS)** no PostgreSQL.
> - **Estratégia de Chaves Primárias**: Identificadores internos em `BIGSERIAL` para máxima performance de junções e índices B-Tree, acompanhados de coluna `UUID` pública indexada para integrações de API seguras sem enumeração sequencial.
> - **Formato de Impressão de Cupons Fiscais**: Padrão dual no PDV e na retaguarda fiscal, permitindo ao operador selecionar entre **Cupom Térmico Contínuo 80mm** (padrão bobina POS) e **DANFE A4 Documento Auxiliar** para impressoras laser/jato de tinta convencionais, com botão de impressão direta acionando `@media print`.

---

### 1. Visão Geral & Proposta de Valor

- **Para o Operador de Caixa & Atendimento**: Impressão instantânea de cupons de venda e comprovantes fiscais autorizados pela SEFAZ com um clique (`F10` ou botão Imprimir), suportando tanto impressoras térmicas não-fiscais/fiscais (Daruma, Bematech, Epson TM-T20) quanto impressoras convencionais de escritório.
- **Para o Administrador & DBA**: Um banco de dados PostgreSQL 16 de nível enterprise, normalizado (3FN), com integridade referencial rigorosa, constraints de auditoria, triggers de baixa de estoque e rastreabilidade total de faturamento e fluxo financeiro.

---

### 2. Experiência do Usuário & Interface

- **Fluxo de Impressão no PDV**:
  1. Ao finalizar a venda com pagamento confirmado, o modal de conclusão apresenta opções claras:
     - **Imprimir Cupom Térmico (80mm)**: Abre o layout estilizado com cabeçalho fiscal, itens em fonte monoespaçada, totais, tributos (Lei 12.741/2012), chave de 44 dígitos e QR Code SEFAZ.
     - **Imprimir DANFE Simplificada (A4)**: Abre a visualização no formato padrão A4 com margens otimizadas e dados cadastrais completos.
  2. Histórico de Vendas e Módulo Fiscal: Inclusão de ação rápida de reimpressão com 1 clique para qualquer venda ou documento anterior.
  3. Folha de estilo de impressão limpa (`@media print`): Oculta barras de navegação, rodapés e botões de interface, imprimindo estritamente o comprovante selecionado.

- **Módulo Explorador do Banco de Dados no Frontend**:
  - Nova aba no menu lateral: **Banco de Dados & DBA Console**.
  - Permite visualizar o **Diagrama ER interativo**, inspecionar o schema de todas as 20+ tabelas, executar queries de teste ao vivo no console SQL e baixar os arquivos gerados (`database.sql`, `seed.sql`, `docker-compose.yml`, `database-documentation.md`).

---

### 3. Decisões Técnicas & Arquitetura de Dados

- **Camada de Isolamento Multi-Empresa**:
  - Tabelas transacionais possuem `company_id` referenciando `companies(id)`.
  - Habilitação de `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` com política `current_setting('app.current_company_id')` para isolamento de dados entre filiais.
- **Triggers e Integridade no Banco**:
  - `fn_trg_sales_stock_deduction`: Trigger automático `AFTER INSERT ON sale_items` que debita o estoque do produto e gera o registro auditado em `stock_movements`.
  - `fn_trg_prevent_negative_stock`: Bloqueio em nível de banco para impedir estoques negativos em produtos com controle rígido.
- **Precisão Financeira**:
  - Todas as colunas financeiras (preços, totais, tributos, troco, saldos de caixa, contas a pagar e receber) utilizam estritamente `NUMERIC(15, 2)`.

---

### 4. Diagrama do Banco de Dados & Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NEXUS DATABASE SCHEMA (POSTGRESQL 16)                │
└─────────────────────────────────────────────────────────────────────────────┘

    [companies] (Empresas & Filiais)
         ▲
         │ (1:N)
    ┌────┴───────────────────────────────┬───────────────────────────────┐
    │                                    │                               │
 [users]                            [products]                      [customers]
 (Perfis & RBAC)                    (Catálogo & Preços)             (Pessoas & Crédito)
    │                                    │                               │
    │ (1:N)                              │ (1:N)                         │ (1:N)
    ▼                                    ▼                               ▼
 [cash_registers]                   [sale_items] ◄─────────────── [sales]
 (Caixas & Turnos)                  (Itens Vendidos)              (Vendas PDV)
    │                                    ▲                               │
    │ (1:N)                              │ (1:N)                         │ (1:1)
    ▼                                    │                               ▼
 [cash_movements]                   [stock_movements]               [invoices]
 (Sangria / Suprimento)             (Entrada/Saída/Ajuste)          (NFC-e / NF-e 4.00)
                                                                         │
                                                                         │ (1:N)
                                                                         ▼
                                                                    [sale_payments]
                                                                    (Dinheiro, Pix, TEF)
```

#### Entregáveis Arquiteturais Gerados:
1. `backend-java/database.sql`: Script DDL consolidado de criação completa do banco PostgreSQL com 20 tabelas, índices e triggers.
2. `backend-java/seed.sql`: Carga inicial completa com dados comerciais de empresas, operadores, categorias, produtos com EAN-13, clientes, fornecedores e histórico financeiro.
3. `backend-java/docker-compose.yml`: Configuração atualizada do PostgreSQL 16 com volume persistente e script de inicialização automática.
4. `backend-java/src/main/resources/application.properties`: Configuração completa de conexão HikariCP, JPA e Flyway para Spring Boot.
5. `backend-java/src/main/resources/db/migration/`:
   - `V1__create_tables.sql`: Tabelas, chaves primárias e relacionamentos.
   - `V2__triggers_and_rls.sql`: Triggers de baixa de estoque e regras de segurança multi-empresa.
   - `V3__seed_data.sql`: Carga de dados inicial controlada via migração.
6. `backend-java/database-documentation.md`: Dicionário completo de dados com tabelas, tipos, constraints e regras de negócio.
7. Atualização do Frontend:
   - Suporte dual à impressão (térmico 80mm + DANFE A4) no PDV e na lista fiscal.
   - Aba **Banco de Dados (DBA Console)** para inspeção e testes ao vivo.
