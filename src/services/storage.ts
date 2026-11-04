import {
  User,
  Category,
  Brand,
  Product,
  StockMovement,
  Sale,
  CashRegister,
  CashMovement,
  Customer,
  Supplier,
  AccountPayable,
  AccountReceivable,
  Invoice,
  AuditLog,
  PaymentItem
} from '../types';

const STORAGE_KEY = 'NEXUS_PDV_ERP_DATABASE_V1';

export interface AppDatabase {
  users: User[];
  categories: Category[];
  brands: Brand[];
  products: Product[];
  stockMovements: StockMovement[];
  sales: Sale[];
  cashRegisters: CashRegister[];
  cashMovements: CashMovement[];
  customers: Customer[];
  suppliers: Supplier[];
  accountsPayable: AccountPayable[];
  accountsReceivable: AccountReceivable[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  currentUser: User;
}

const INITIAL_DATABASE: AppDatabase = {
  currentUser: {
    id: 'u-1',
    name: 'Carlos Silva (Administrador)',
    email: 'carlos.admin@nexuspdv.com.br',
    role: 'ADMIN',
    active: true,
    createdAt: '2025-01-10T08:00:00Z',
  },
  users: [
    {
      id: 'u-1',
      name: 'Carlos Silva (Administrador)',
      email: 'carlos.admin@nexuspdv.com.br',
      role: 'ADMIN',
      active: true,
      createdAt: '2025-01-10T08:00:00Z',
    },
    {
      id: 'u-2',
      name: 'Fernanda Lima (Gerente)',
      email: 'fernanda.gerente@nexuspdv.com.br',
      role: 'GERENTE',
      active: true,
      createdAt: '2025-01-12T09:30:00Z',
    },
    {
      id: 'u-3',
      name: 'Lucas Souza (Operador de Caixa)',
      email: 'lucas.caixa@nexuspdv.com.br',
      role: 'OPERADOR_CAIXA',
      active: true,
      createdAt: '2025-01-15T07:45:00Z',
    },
    {
      id: 'u-4',
      name: 'Mariana Duarte (Estoquista)',
      email: 'mariana.estoque@nexuspdv.com.br',
      role: 'ESTOQUISTA',
      active: true,
      createdAt: '2025-01-20T10:15:00Z',
    },
  ],
  categories: [
    { id: 'cat-1', name: 'Bebidas e Sucos', color: '#3b82f6' },
    { id: 'cat-2', name: 'Alimentos e Mercearia', color: '#10b981' },
    { id: 'cat-3', name: 'Higiene e Beleza', color: '#ec4899' },
    { id: 'cat-4', name: 'Limpeza e Utilidades', color: '#8b5cf6' },
    { id: 'cat-5', name: 'Padaria e Frios', color: '#f59e0b' },
  ],
  brands: [
    { id: 'br-1', name: 'Coca-Cola' },
    { id: 'br-2', name: 'Nestlé' },
    { id: 'br-3', name: 'Ambev' },
    { id: 'br-4', name: 'Unilever' },
    { id: 'br-5', name: 'Seara' },
  ],
  products: [
    {
      id: 'prod-1',
      name: 'Refrigerante Coca-Cola 2L Pet',
      sku: 'REF-CC2L',
      barcode: '7894900011517',
      categoryId: 'cat-1',
      categoryName: 'Bebidas e Sucos',
      brandId: 'br-1',
      brandName: 'Coca-Cola',
      costPrice: 6.80,
      salePrice: 11.90,
      marginPercent: 75.0,
      currentStock: 48,
      minStock: 15,
      unit: 'UN',
      active: true,
      ncm: '2202.10.00',
      cfop: '5.102',
      cstCsosn: '0102',
      icmsAliquota: 18.0,
      pisAliquota: 1.65,
      cofinsAliquota: 7.60,
      description: 'Refrigerante Coca-Cola garrafa pet 2 litros gelado ou temperatura ambiente.',
      createdAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'prod-2',
      name: 'Café Torrado e Moído Pilão Tradicional 500g',
      sku: 'ALM-CAF500',
      barcode: '7896005800262',
      categoryId: 'cat-2',
      categoryName: 'Alimentos e Mercearia',
      brandId: 'br-2',
      brandName: 'Nestlé',
      costPrice: 14.50,
      salePrice: 21.90,
      marginPercent: 51.0,
      currentStock: 32,
      minStock: 10,
      unit: 'UN',
      active: true,
      ncm: '0901.21.00',
      cfop: '5.102',
      cstCsosn: '0102',
      icmsAliquota: 12.0,
      pisAliquota: 1.65,
      cofinsAliquota: 7.60,
      description: 'Café em pó a vácuo ponto tradicional extra forte.',
      createdAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'prod-3',
      name: 'Cerveja Heineken Puro Malte Long Neck 330ml',
      sku: 'BEB-HEIN330',
      barcode: '7896045505196',
      categoryId: 'cat-1',
      categoryName: 'Bebidas e Sucos',
      brandId: 'br-3',
      brandName: 'Ambev',
      costPrice: 4.80,
      salePrice: 8.50,
      marginPercent: 77.0,
      currentStock: 7,
      minStock: 24, // Alerta de estoque baixo!
      unit: 'UN',
      active: true,
      ncm: '2203.00.00',
      cfop: '5.405',
      cstCsosn: '0500',
      icmsAliquota: 25.0,
      pisAliquota: 1.65,
      cofinsAliquota: 7.60,
      description: 'Cerveja premium lager puro malte garrafa long neck 330ml.',
      createdAt: '2025-01-11T11:00:00Z',
    },
    {
      id: 'prod-4',
      name: 'Sabonete Dove Original 90g',
      sku: 'HIG-DOV90',
      barcode: '7891150005234',
      categoryId: 'cat-3',
      categoryName: 'Higiene e Beleza',
      brandId: 'br-4',
      brandName: 'Unilever',
      costPrice: 2.70,
      salePrice: 4.90,
      marginPercent: 81.5,
      currentStock: 64,
      minStock: 20,
      unit: 'UN',
      active: true,
      ncm: '3401.11.90',
      cfop: '5.102',
      cstCsosn: '0102',
      icmsAliquota: 18.0,
      pisAliquota: 1.65,
      cofinsAliquota: 7.60,
      description: 'Sabonete em barra com 1/4 de creme hidratante.',
      createdAt: '2025-01-12T14:00:00Z',
    },
    {
      id: 'prod-5',
      name: 'Detergente Líquido Ypê Neutro 500ml',
      sku: 'LMP-YPE500',
      barcode: '7896098900214',
      categoryId: 'cat-4',
      categoryName: 'Limpeza e Utilidades',
      brandId: 'br-4',
      brandName: 'Unilever',
      costPrice: 1.65,
      salePrice: 2.89,
      marginPercent: 75.1,
      currentStock: 90,
      minStock: 30,
      unit: 'UN',
      active: true,
      ncm: '3402.20.00',
      cfop: '5.102',
      cstCsosn: '0102',
      icmsAliquota: 18.0,
      pisAliquota: 1.65,
      cofinsAliquota: 7.60,
      description: 'Detergente líquido lava louças biodegradável.',
      createdAt: '2025-01-14T09:00:00Z',
    },
    {
      id: 'prod-6',
      name: 'Queijo Mussarela Fatiado 200g',
      sku: 'PAD-MUS200',
      barcode: '7891515432019',
      categoryId: 'cat-5',
      categoryName: 'Padaria e Frios',
      brandId: 'br-5',
      brandName: 'Seara',
      costPrice: 8.90,
      salePrice: 14.50,
      marginPercent: 62.9,
      currentStock: 4, // Alerta baixo
      minStock: 12,
      unit: 'UN',
      active: true,
      ncm: '0406.10.10',
      cfop: '5.102',
      cstCsosn: '0102',
      icmsAliquota: 12.0,
      pisAliquota: 1.65,
      cofinsAliquota: 7.60,
      description: 'Queijo mussarela fatiado fresco em bandeja a vácuo.',
      createdAt: '2025-01-15T08:30:00Z',
    },
    {
      id: 'prod-7',
      name: 'Arroz Branco Tipo 1 Tio João 5kg',
      sku: 'ALM-ARR5K',
      barcode: '7896006700011',
      categoryId: 'cat-2',
      categoryName: 'Alimentos e Mercearia',
      brandId: 'br-2',
      brandName: 'Nestlé',
      costPrice: 24.50,
      salePrice: 32.90,
      marginPercent: 34.3,
      currentStock: 35,
      minStock: 15,
      unit: 'UN',
      active: true,
      ncm: '1006.30.21',
      cfop: '5.102',
      cstCsosn: '0102',
      icmsAliquota: 7.0,
      pisAliquota: 0.0,
      cofinsAliquota: 0.0,
      description: 'Arroz subgrupo polido classe longo fino tipo 1.',
      createdAt: '2025-01-16T12:00:00Z',
    },
    {
      id: 'prod-8',
      name: 'Água Mineral Crystal Sem Gás 500ml',
      sku: 'BEB-AG500',
      barcode: '7894900530018',
      categoryId: 'cat-1',
      categoryName: 'Bebidas e Sucos',
      brandId: 'br-1',
      brandName: 'Coca-Cola',
      costPrice: 1.10,
      salePrice: 3.00,
      marginPercent: 172.7,
      currentStock: 120,
      minStock: 40,
      unit: 'UN',
      active: true,
      ncm: '2201.10.00',
      cfop: '5.102',
      cstCsosn: '0102',
      icmsAliquota: 18.0,
      pisAliquota: 1.65,
      cofinsAliquota: 7.60,
      description: 'Água mineral natural levemente fluoretada.',
      createdAt: '2025-01-17T09:00:00Z',
    }
  ],
  stockMovements: [
    {
      id: 'mov-1',
      productId: 'prod-1',
      productName: 'Refrigerante Coca-Cola 2L Pet',
      type: 'ENTRADA',
      quantity: 60,
      unitPrice: 6.80,
      totalValue: 408.00,
      reason: 'Compra Fornecedor NF-e 88391',
      userId: 'u-1',
      userName: 'Carlos Silva',
      timestamp: '2025-02-01T09:00:00Z',
    },
    {
      id: 'mov-2',
      productId: 'prod-3',
      productName: 'Cerveja Heineken Puro Malte Long Neck 330ml',
      type: 'PERDA_AVARIA',
      quantity: 3,
      unitPrice: 4.80,
      totalValue: 14.40,
      reason: 'Garrafas quebradas no transporte interno',
      userId: 'u-4',
      userName: 'Mariana Duarte',
      timestamp: '2025-02-02T14:20:00Z',
    }
  ],
  sales: [
    {
      id: 'sale-101',
      code: 'VD-20250001',
      cashRegisterId: 'cx-1',
      operatorId: 'u-3',
      operatorName: 'Lucas Souza',
      customerName: 'Consumidor Final',
      items: [
        {
          productId: 'prod-1',
          productName: 'Refrigerante Coca-Cola 2L Pet',
          barcode: '7894900011517',
          sku: 'REF-CC2L',
          quantity: 2,
          unitPrice: 11.90,
          discount: 0,
          total: 23.80,
        },
        {
          productId: 'prod-2',
          productName: 'Café Torrado e Moído Pilão Tradicional 500g',
          barcode: '7896005800262',
          sku: 'ALM-CAF500',
          quantity: 1,
          unitPrice: 21.90,
          discount: 0,
          total: 21.90,
        }
      ],
      subtotal: 45.70,
      discountTotal: 0,
      additionTotal: 0,
      total: 45.70,
      payments: [
        {
          id: 'pay-1',
          method: 'PIX',
          amount: 45.70,
          tefAuthCode: 'PIX-993821038'
        }
      ],
      change: 0,
      status: 'CONCLUIDA',
      fiscalKey: '35250212345678000190650010000000011883920194',
      invoiceNumber: '000001',
      createdAt: '2025-02-03T11:24:00Z',
    }
  ],
  cashRegisters: [
    {
      id: 'cx-1',
      terminalNumber: 1,
      operatorId: 'u-3',
      operatorName: 'Lucas Souza',
      openedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      initialBalance: 150.00,
      currentBalance: 195.70,
      totalSales: 45.70,
      totalSangria: 0,
      totalSuprimento: 0,
      status: 'ABERTO',
      paymentsBreakdown: {
        DINHEIRO: 0,
        PIX: 45.70,
        CARTAO_CREDITO: 0,
        CARTAO_DEBITO: 0,
        CREDIARIO: 0,
      }
    }
  ],
  cashMovements: [
    {
      id: 'cm-1',
      cashRegisterId: 'cx-1',
      type: 'SUPRIMENTO',
      amount: 150.00,
      reason: 'Fundo de Troco Inicial para Abertura de Caixa',
      userId: 'u-3',
      userName: 'Lucas Souza',
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    }
  ],
  customers: [
    {
      id: 'cust-1',
      name: 'Marcos Vinicius Pereira',
      cpfCnpj: '234.567.890-12',
      email: 'marcos.pereira@gmail.com',
      phone: '(11) 98765-4321',
      address: 'Rua das Flores, 142, Apto 32',
      city: 'São Paulo',
      state: 'SP',
      creditLimit: 1200.00,
      creditUsed: 150.00,
      totalPurchases: 3240.50,
      createdAt: '2025-01-05T10:00:00Z',
    },
    {
      id: 'cust-2',
      name: 'Restaurante Sabor & Arte Ltda',
      cpfCnpj: '45.123.890/0001-44',
      email: 'compras@saborearte.com.br',
      phone: '(11) 3456-7890',
      address: 'Av. Paulista, 1000 - Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      creditLimit: 8000.00,
      creditUsed: 1850.00,
      totalPurchases: 14890.00,
      createdAt: '2025-01-10T14:30:00Z',
    }
  ],
  suppliers: [
    {
      id: 'sup-1',
      corporateName: 'Distribuidora de Bebidas Brasil S/A',
      tradeName: 'Bebidas Brasil Express',
      cnpj: '12.345.678/0001-90',
      email: 'pedidos@bebidasbrasil.com.br',
      phone: '(11) 4002-8922',
      contactPerson: 'Roberto Antunes',
      category: 'Bebidas e Destilados',
      createdAt: '2025-01-02T09:00:00Z',
    },
    {
      id: 'sup-2',
      corporateName: 'Atacadão de Alimentos Centro Oeste Ltda',
      tradeName: 'Atacadão Central',
      cnpj: '98.765.432/0001-11',
      email: 'vendas@atacadaocentral.com.br',
      phone: '(11) 3322-1100',
      contactPerson: 'Camila Fagundes',
      category: 'Mercearia e Grãos',
      createdAt: '2025-01-03T11:00:00Z',
    }
  ],
  accountsPayable: [
    {
      id: 'ap-1',
      supplierId: 'sup-1',
      supplierName: 'Distribuidora de Bebidas Brasil S/A',
      description: 'NF-e 88391 - Fardos de Coca-Cola e Sucos',
      category: 'Fornecedores de Mercadoria',
      amount: 1450.00,
      dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'PENDENTE',
      notes: 'Boleto bancário Itaú com 30 dias',
    },
    {
      id: 'ap-2',
      supplierId: 'sup-2',
      supplierName: 'Atacadão de Alimentos Centro Oeste Ltda',
      description: 'NF-e 44102 - Sacos de Café e Arroz',
      category: 'Fornecedores de Mercadoria',
      amount: 2890.00,
      dueDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      paidDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'PAGO',
      paymentMethod: 'Transferência Pix',
      notes: 'Pago com desconto de pontualidade',
    }
  ],
  accountsReceivable: [
    {
      id: 'ar-1',
      customerId: 'cust-2',
      customerName: 'Restaurante Sabor & Arte Ltda',
      saleId: 'sale-98',
      description: 'Venda a Prazo - Faturado Boleto 30D',
      amount: 1850.00,
      dueDate: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'PENDENTE',
      installment: '1/1',
    }
  ],
  invoices: [
    {
      id: 'inv-1',
      saleId: 'sale-101',
      invoiceNumber: '000001',
      series: '1',
      model: '65',
      accessKey: '35250212345678000190650010000000011883920194',
      environment: 'HOMOLOGACAO',
      protocol: '135250000918239',
      emissionDate: '2025-02-03T11:24:00Z',
      status: 'AUTORIZADA',
      digestValue: '9HkzW3B+c2yvQ2Y2kLpM=',
      qrCodeUrl: 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35250212345678000190650010000000011883920194|2|1|1|45.70',
      totalAmount: 45.70,
      customerName: 'Consumidor Final',
      customerCpfCnpj: undefined,
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      userId: 'u-3',
      userName: 'Lucas Souza',
      userRole: 'OPERADOR_CAIXA',
      action: 'ABERTURA_CAIXA',
      module: 'PDV',
      details: 'Caixa terminal #1 aberto com fundo de R$ 150,00',
      ipAddress: '192.168.1.45',
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'log-2',
      userId: 'u-3',
      userName: 'Lucas Souza',
      userRole: 'OPERADOR_CAIXA',
      action: 'VENDA_CONCLUIDA',
      module: 'PDV',
      details: 'Venda VD-20250001 concluída no valor de R$ 45,70 (PIX). NFC-e 000001 autorizada.',
      ipAddress: '192.168.1.45',
      timestamp: '2025-02-03T11:24:00Z',
    }
  ]
};

export class StorageService {
  private static getDb(): AppDatabase {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    }
    this.saveDb(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }

  private static saveDb(db: AppDatabase): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  static resetDatabase(): AppDatabase {
    this.saveDb(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }

  static getDatabase(): AppDatabase {
    return this.getDb();
  }

  static getCurrentUser(): User {
    return this.getDb().currentUser;
  }

  static setCurrentUser(user: User): void {
    const db = this.getDb();
    db.currentUser = user;
    this.saveDb(db);
    this.logAction(user, 'LOGIN', 'AUTENTICACAO', `Usuário alterado para ${user.name} (${user.role})`);
  }

  static getUsers(): User[] {
    return this.getDb().users;
  }

  static getProducts(): Product[] {
    return this.getDb().products;
  }

  static saveProduct(product: Product): Product {
    const db = this.getDb();
    const index = db.products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      db.products[index] = product;
      this.logAction(db.currentUser, 'ATUALIZAR_PRODUTO', 'PRODUTOS', `Produto ${product.name} (SKU: ${product.sku}) atualizado`);
    } else {
      db.products.unshift(product);
      this.logAction(db.currentUser, 'CRIAR_PRODUTO', 'PRODUTOS', `Produto ${product.name} (SKU: ${product.sku}) cadastrado`);
    }
    this.saveDb(db);
    return product;
  }

  static deleteProduct(productId: string): void {
    const db = this.getDb();
    const product = db.products.find(p => p.id === productId);
    db.products = db.products.filter(p => p.id !== productId);
    this.saveDb(db);
    if (product) {
      this.logAction(db.currentUser, 'EXCLUIR_PRODUTO', 'PRODUTOS', `Produto ${product.name} excluído`);
    }
  }

  static getCategories(): Category[] {
    return this.getDb().categories;
  }

  static saveCategory(category: Category): Category {
    const db = this.getDb();
    const index = db.categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      db.categories[index] = category;
    } else {
      db.categories.push(category);
    }
    this.saveDb(db);
    return category;
  }

  static getBrands(): Brand[] {
    return this.getDb().brands;
  }

  static saveBrand(brand: Brand): Brand {
    const db = this.getDb();
    const index = db.brands.findIndex(b => b.id === brand.id);
    if (index >= 0) {
      db.brands[index] = brand;
    } else {
      db.brands.push(brand);
    }
    this.saveDb(db);
    return brand;
  }

  static getStockMovements(): StockMovement[] {
    return this.getDb().stockMovements;
  }

  static addStockMovement(movement: StockMovement): void {
    const db = this.getDb();
    db.stockMovements.unshift(movement);
    
    // Atualizar saldo do produto
    const product = db.products.find(p => p.id === movement.productId);
    if (product) {
      if (movement.type === 'ENTRADA') {
        product.currentStock += movement.quantity;
      } else if (movement.type === 'SAIDA' || movement.type === 'PERDA_AVARIA') {
        product.currentStock = Math.max(0, product.currentStock - movement.quantity);
      } else if (movement.type === 'AJUSTE') {
        product.currentStock = movement.quantity;
      }
    }

    this.logAction(
      db.currentUser,
      `MOVIMENTO_ESTOQUE_${movement.type}`,
      'ESTOQUE',
      `${movement.type} de ${movement.quantity} unidades em ${movement.productName}. Motivo: ${movement.reason}`
    );

    this.saveDb(db);
  }

  static getActiveCashRegister(): CashRegister | null {
    const db = this.getDb();
    return db.cashRegisters.find(c => c.status === 'ABERTO') || null;
  }

  static openCashRegister(initialBalance: number, terminalNumber = 1): CashRegister {
    const db = this.getDb();
    const active = db.cashRegisters.find(c => c.status === 'ABERTO');
    if (active) {
      throw new Error('Já existe um caixa aberto no momento!');
    }

    const newCashRegister: CashRegister = {
      id: 'cx-' + Date.now(),
      terminalNumber,
      operatorId: db.currentUser.id,
      operatorName: db.currentUser.name,
      openedAt: new Date().toISOString(),
      initialBalance,
      currentBalance: initialBalance,
      totalSales: 0,
      totalSangria: 0,
      totalSuprimento: 0,
      status: 'ABERTO',
      paymentsBreakdown: {
        DINHEIRO: 0,
        PIX: 0,
        CARTAO_CREDITO: 0,
        CARTAO_DEBITO: 0,
        CREDIARIO: 0,
      }
    };

    db.cashRegisters.unshift(newCashRegister);

    // Registrar movimentação de abertura/suprimento inicial
    db.cashMovements.unshift({
      id: 'cm-' + Date.now(),
      cashRegisterId: newCashRegister.id,
      type: 'SUPRIMENTO',
      amount: initialBalance,
      reason: 'Fundo de troco inicial para abertura de caixa',
      userId: db.currentUser.id,
      userName: db.currentUser.name,
      timestamp: new Date().toISOString(),
    });

    this.logAction(
      db.currentUser,
      'ABERTURA_CAIXA',
      'CAIXA',
      `Caixa #${terminalNumber} aberto com saldo inicial de R$ ${initialBalance.toFixed(2)}`
    );

    this.saveDb(db);
    return newCashRegister;
  }

  static closeCashRegister(cashRegisterId: string, closingNotes = ''): CashRegister {
    const db = this.getDb();
    const cash = db.cashRegisters.find(c => c.id === cashRegisterId);
    if (!cash) throw new Error('Caixa não encontrado');

    cash.status = 'FECHADO';
    cash.closedAt = new Date().toISOString();
    cash.closingNotes = closingNotes;

    this.logAction(
      db.currentUser,
      'FECHAMENTO_CAIXA',
      'CAIXA',
      `Caixa #${cash.terminalNumber} fechado. Total em vendas: R$ ${cash.totalSales.toFixed(2)}. Saldo final apurado: R$ ${cash.currentBalance.toFixed(2)}`
    );

    this.saveDb(db);
    return cash;
  }

  static addCashMovement(cashRegisterId: string, type: 'SANGRIA' | 'SUPRIMENTO', amount: number, reason: string): CashMovement {
    const db = this.getDb();
    const cash = db.cashRegisters.find(c => c.id === cashRegisterId);
    if (!cash) throw new Error('Caixa não encontrado');

    if (type === 'SANGRIA') {
      if (cash.currentBalance < amount) {
        throw new Error(`Saldo em caixa (R$ ${cash.currentBalance.toFixed(2)}) insuficiente para sangria de R$ ${amount.toFixed(2)}`);
      }
      cash.currentBalance -= amount;
      cash.totalSangria += amount;
    } else {
      cash.currentBalance += amount;
      cash.totalSuprimento += amount;
    }

    const movement: CashMovement = {
      id: 'cm-' + Date.now(),
      cashRegisterId,
      type,
      amount,
      reason,
      userId: db.currentUser.id,
      userName: db.currentUser.name,
      timestamp: new Date().toISOString(),
    };

    db.cashMovements.unshift(movement);

    this.logAction(
      db.currentUser,
      type,
      'CAIXA',
      `${type} de R$ ${amount.toFixed(2)} efetuada. Motivo: ${reason}`
    );

    this.saveDb(db);
    return movement;
  }

  static getCashMovements(cashRegisterId?: string): CashMovement[] {
    const db = this.getDb();
    if (!cashRegisterId) return db.cashMovements;
    return db.cashMovements.filter(m => m.cashRegisterId === cashRegisterId);
  }

  static completeSale(saleData: Omit<Sale, 'id' | 'code' | 'createdAt' | 'status'>): { sale: Sale; invoice: Invoice } {
    const db = this.getDb();
    const activeCash = this.getActiveCashRegister();
    if (!activeCash) {
      throw new Error('Não é possível vender com o caixa fechado! Abra o caixa primeiro.');
    }

    // Gerar código único e chave fiscal 44 dígitos
    const saleCount = db.sales.length + 1;
    const saleCode = `VD-${new Date().getFullYear()}${String(saleCount).padStart(5, '0')}`;
    const invoiceNumber = String(db.invoices.length + 1).padStart(6, '0');
    
    // Algoritmo Chave de Acesso SEFAZ (44 dígitos)
    // cUF (35) + AAMM + CNPJ (14) + mod (65) + serie (001) + nNF (9) + tpEmis (1) + cNF (8) + cDV (1)
    const yearMonth = new Date().toISOString().slice(2, 7).replace('-', '');
    const cnpjEmit = '12345678000190';
    const cNF = Math.floor(10000000 + Math.random() * 90000000);
    const rawKeyWithoutDV = `35${yearMonth}${cnpjEmit}65001${invoiceNumber.padStart(9, '0')}1${cNF}`;
    
    // Cálculo módulo 11
    let weight = 2;
    let sum = 0;
    for (let i = rawKeyWithoutDV.length - 1; i >= 0; i--) {
      sum += parseInt(rawKeyWithoutDV[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    const remainder = sum % 11;
    const dv = (remainder === 0 || remainder === 1) ? 0 : 11 - remainder;
    const fiscalKey = `${rawKeyWithoutDV}${dv}`;

    const newSale: Sale = {
      ...saleData,
      id: 'sale-' + Date.now(),
      code: saleCode,
      status: 'CONCLUIDA',
      fiscalKey,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    // 1. Dar baixa no estoque
    for (const item of newSale.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (product) {
        product.currentStock = Math.max(0, product.currentStock - item.quantity);
        db.stockMovements.unshift({
          id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(7),
          productId: product.id,
          productName: product.name,
          type: 'SAIDA',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalValue: item.total,
          reason: `Venda no PDV ${saleCode}`,
          userId: db.currentUser.id,
          userName: db.currentUser.name,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 2. Atualizar caixa
    activeCash.totalSales += newSale.total;
    for (const payment of newSale.payments) {
      activeCash.paymentsBreakdown[payment.method] = 
        (activeCash.paymentsBreakdown[payment.method] || 0) + payment.amount;
      if (payment.method === 'DINHEIRO') {
        activeCash.currentBalance += (payment.amount - (newSale.change || 0));
      }
    }

    // 3. Gerar NFC-e Oficial SEFAZ
    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      saleId: newSale.id,
      invoiceNumber,
      series: '1',
      model: '65',
      accessKey: fiscalKey,
      environment: 'HOMOLOGACAO',
      protocol: '135' + Date.now().toString().slice(0, 12),
      emissionDate: newSale.createdAt,
      status: 'AUTORIZADA',
      digestValue: btoa(fiscalKey.slice(0, 16)),
      qrCodeUrl: `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${fiscalKey}|2|1|1|${newSale.total.toFixed(2)}`,
      totalAmount: newSale.total,
      customerName: newSale.customerName || 'Consumidor Final',
      customerCpfCnpj: newSale.customerCpfCnpj,
    };

    // 4. Se for venda a prazo (CREDIARIO), lançar no Contas a Receber
    const crediarioPay = newSale.payments.find(p => p.method === 'CREDIARIO');
    if (crediarioPay && crediarioPay.amount > 0) {
      db.accountsReceivable.unshift({
        id: 'ar-' + Date.now(),
        customerId: newSale.customerId,
        customerName: newSale.customerName || 'Cliente sem cadastro',
        saleId: newSale.id,
        description: `Venda Crediário PDV ${saleCode}`,
        amount: crediarioPay.amount,
        dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'PENDENTE',
        installment: '1/1',
      });
      // Atualizar limite usado do cliente
      if (newSale.customerId) {
        const cust = db.customers.find(c => c.id === newSale.customerId);
        if (cust) {
          cust.creditUsed += crediarioPay.amount;
        }
      }
    }

    // Atualizar compras do cliente
    if (newSale.customerId) {
      const cust = db.customers.find(c => c.id === newSale.customerId);
      if (cust) {
        cust.totalPurchases += newSale.total;
      }
    }

    db.sales.unshift(newSale);
    db.invoices.unshift(newInvoice);

    this.logAction(
      db.currentUser,
      'VENDA_CONCLUIDA',
      'PDV',
      `Venda ${newSale.code} de R$ ${newSale.total.toFixed(2)} concluída com sucesso. NFC-e ${newInvoice.invoiceNumber} autorizada.`
    );

    this.saveDb(db);
    return { sale: newSale, invoice: newInvoice };
  }

  static cancelSale(saleId: string, reason: string): Sale {
    const db = this.getDb();
    const sale = db.sales.find(s => s.id === saleId);
    if (!sale) throw new Error('Venda não encontrada');
    if (sale.status === 'CANCELADA') throw new Error('Venda já está cancelada');

    sale.status = 'CANCELADA';
    sale.cancelledReason = reason;

    // Estornar estoque
    for (const item of sale.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (product) {
        product.currentStock += item.quantity;
        db.stockMovements.unshift({
          id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(7),
          productId: product.id,
          productName: product.name,
          type: 'ENTRADA',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalValue: item.total,
          reason: `Estorno cancelamento de venda ${sale.code}: ${reason}`,
          userId: db.currentUser.id,
          userName: db.currentUser.name,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Cancelar nota fiscal associada
    const invoice = db.invoices.find(inv => inv.saleId === saleId);
    if (invoice) {
      invoice.status = 'CANCELADA';
    }

    this.logAction(
      db.currentUser,
      'CANCELAMENTO_VENDA',
      'PDV',
      `Venda ${sale.code} no valor de R$ ${sale.total.toFixed(2)} foi CANCELADA. Motivo: ${reason}`
    );

    this.saveDb(db);
    return sale;
  }

  static getSales(): Sale[] {
    return this.getDb().sales;
  }

  static getInvoices(): Invoice[] {
    return this.getDb().invoices;
  }

  static getCustomers(): Customer[] {
    return this.getDb().customers;
  }

  static saveCustomer(customer: Customer): Customer {
    const db = this.getDb();
    const index = db.customers.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      db.customers[index] = customer;
    } else {
      db.customers.unshift(customer);
    }
    this.saveDb(db);
    return customer;
  }

  static getSuppliers(): Supplier[] {
    return this.getDb().suppliers;
  }

  static saveSupplier(supplier: Supplier): Supplier {
    const db = this.getDb();
    const index = db.suppliers.findIndex(s => s.id === supplier.id);
    if (index >= 0) {
      db.suppliers[index] = supplier;
    } else {
      db.suppliers.unshift(supplier);
    }
    this.saveDb(db);
    return supplier;
  }

  static getAccountsPayable(): AccountPayable[] {
    return this.getDb().accountsPayable;
  }

  static saveAccountPayable(ap: AccountPayable): AccountPayable {
    const db = this.getDb();
    const index = db.accountsPayable.findIndex(a => a.id === ap.id);
    if (index >= 0) {
      db.accountsPayable[index] = ap;
    } else {
      db.accountsPayable.unshift(ap);
    }
    this.saveDb(db);
    return ap;
  }

  static markAccountPayableAsPaid(id: string, paymentMethod: string): void {
    const db = this.getDb();
    const ap = db.accountsPayable.find(a => a.id === id);
    if (ap) {
      ap.status = 'PAGO';
      ap.paidDate = new Date().toISOString().split('T')[0];
      ap.paymentMethod = paymentMethod;
      this.logAction(db.currentUser, 'PAGAMENTO_CONTA', 'FINANCEIRO', `Conta a pagar "${ap.description}" no valor de R$ ${ap.amount.toFixed(2)} quitada via ${paymentMethod}`);
      this.saveDb(db);
    }
  }

  static getAccountsReceivable(): AccountReceivable[] {
    return this.getDb().accountsReceivable;
  }

  static markAccountReceivableAsReceived(id: string): void {
    const db = this.getDb();
    const ar = db.accountsReceivable.find(a => a.id === id);
    if (ar) {
      ar.status = 'PAGO';
      ar.receivedDate = new Date().toISOString().split('T')[0];
      if (ar.customerId) {
        const cust = db.customers.find(c => c.id === ar.customerId);
        if (cust) {
          cust.creditUsed = Math.max(0, cust.creditUsed - ar.amount);
        }
      }
      this.logAction(db.currentUser, 'RECEBIMENTO_CONTA', 'FINANCEIRO', `Recebimento de título "${ar.description}" no valor de R$ ${ar.amount.toFixed(2)}`);
      this.saveDb(db);
    }
  }

  static getAuditLogs(): AuditLog[] {
    return this.getDb().auditLogs;
  }

  static logAction(user: User, action: string, module: string, details: string): void {
    const db = this.getDb();
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(7),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      module,
      details,
      ipAddress: '127.0.0.1 (Local)',
      timestamp: new Date().toISOString(),
    };
    db.auditLogs.unshift(log);
    // Manter últimos 200 logs
    if (db.auditLogs.length > 200) {
      db.auditLogs = db.auditLogs.slice(0, 200);
    }
    this.saveDb(db);
  }
}
