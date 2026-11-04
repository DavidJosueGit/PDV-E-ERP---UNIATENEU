# Nexus PDV & ERP Comercial — Back-End Java Spring Boot 3

Sistema integrado empresarial de automação comercial, Ponto de Venda (PDV), controle de estoque em tempo real, integração TEF para máquinas de cartão e emissão de documentos fiscais eletrônicos brasileiros (NFC-e e NF-e).

---

## 🚀 Tecnologias Utilizadas

- **Java 21 (LTS)**
- **Spring Boot 3.3.4**
- **Spring Data JPA & Hibernate**
- **Spring Security 6 com JWT**
- **PostgreSQL 16**
- **Flyway Migration**
- **SpringDoc OpenAPI 3 / Swagger**
- **Docker & Docker Compose**
- **Lombok**
- **JUnit 5 & Mockito**

---

## 🏛️ Arquitetura do Projeto

O sistema segue a arquitetura em camadas e os princípios SOLID:

```
backend-java/
├── Dockerfile
├── docker-compose.yml
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/nexus/pdverp/
│   │   │   ├── controller/     # Endpoints REST (SaleController, ProductController, etc.)
│   │   │   ├── service/        # Regras de negócio, concorrência e transações
│   │   │   ├── repository/     # Repositórios Spring Data JPA com travas pessimistas
│   │   │   ├── entity/         # Entidades JPA mapeadas (Product, Sale, CashRegister, etc.)
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── security/       # Configuração Spring Security, filtros JWT e BCrypt
│   │   │   └── exception/      # Tratamento global de exceções
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/   # Scripts Flyway (V1__init_schema.sql)
│   └── test/                   # Testes unitários e de integração
```

---

## 🐳 Como Executar com Docker Compose

Para subir o banco de dados PostgreSQL e a aplicação com apenas um comando:

```bash
docker compose up --build -d
```

O Flyway executará automaticamente a criação de todas as tabelas e índices.

- **API Base URL:** `http://localhost:8080/api/v1`
- **Documentação Swagger UI:** `http://localhost:8080/api/v1/swagger-ui.html`
- **OpenAPI JSON Spec:** `http://localhost:8080/api/v1/api-docs`

---

## 💻 Como Executar Localmente com Maven

### 1. Iniciar o PostgreSQL

Certifique-se de que o PostgreSQL está rodando na porta `5432` com a database `nexus_pdv_erp`.

### 2. Compilar e Executar os Testes

```bash
mvn clean test
```

### 3. Iniciar a Aplicação

```bash
mvn spring-boot:run
```

---

## 🔒 Segurança & RBAC (Role-Based Access Control)

O sistema possui 4 perfis de acesso nativos:

1. `ADMIN`: Acesso irrestrito a todos os módulos, configurações fiscais e auditoria.
2. `GERENTE`: Cancelamento de vendas, sangrias, relatórios e controle financeiro.
3. `OPERADOR_CAIXA`: Acesso restrito ao PDV, abertura e fechamento do seu próprio caixa.
4. `ESTOQUISTA`: Entrada de notas, ajustes de inventário e cadastro de produtos.

Senhas são salvas com hash **BCrypt (12 rounds)** e sessões são validadas via tokens **JWT Stateless**.
