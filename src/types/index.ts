export type UserRole = 'ADMIN' | 'GERENTE' | 'OPERADOR_CAIXA' | 'ESTOQUISTA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  costPrice: number;
  salePrice: number;
  marginPercent: number;
  currentStock: number;
  minStock: number;
  unit: string; // UN, KG, LT, CX, MT
  active: boolean;
  image?: string;
  ncm: string;
  cfop: string;
  cstCsosn: string;
  icmsAliquota: number;
  pisAliquota: number;
  cofinsAliquota: number;
  description?: string;
  createdAt: string;
}

export type MovementType = 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'PERDA_AVARIA' | 'TRANSFERENCIA';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reason: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'CREDIARIO';

export interface PaymentItem {
  id: string;
  method: PaymentMethod;
  amount: number;
  installments?: number;
  tefNsu?: string;
  tefAuthCode?: string;
  tefAcquirer?: string;
  change?: number; // Para dinheiro
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export type SaleStatus = 'CONCLUIDA' | 'CANCELADA' | 'PENDENTE';

export interface Sale {
  id: string;
  code: string;
  cashRegisterId: string;
  operatorId: string;
  operatorName: string;
  customerId?: string;
  customerName?: string;
  customerCpfCnpj?: string;
  items: {
    productId: string;
    productName: string;
    barcode: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }[];
  subtotal: number;
  discountTotal: number;
  additionTotal: number;
  total: number;
  payments: PaymentItem[];
  change: number;
  status: SaleStatus;
  fiscalKey?: string;
  invoiceNumber?: string;
  cancelledReason?: string;
  createdAt: string;
}

export type CashRegisterStatus = 'ABERTO' | 'FECHADO';

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  type: 'SUPRIMENTO' | 'SANGRIA' | 'VENDA' | 'CANCELAMENTO';
  amount: number;
  reason: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface CashRegister {
  id: string;
  terminalNumber: number;
  operatorId: string;
  operatorName: string;
  openedAt: string;
  closedAt?: string;
  initialBalance: number;
  currentBalance: number;
  totalSales: number;
  totalSangria: number;
  totalSuprimento: number;
  status: CashRegisterStatus;
  paymentsBreakdown: Record<PaymentMethod, number>;
  closingNotes?: string;
}

export interface Customer {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  creditLimit: number;
  creditUsed: number;
  totalPurchases: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  corporateName: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phone: string;
  contactPerson: string;
  category: string;
  createdAt: string;
}

export type AccountStatus = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';

export interface AccountPayable {
  id: string;
  supplierId: string;
  supplierName: string;
  description: string;
  category: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: AccountStatus;
  paymentMethod?: string;
  notes?: string;
}

export interface AccountReceivable {
  id: string;
  customerId?: string;
  customerName: string;
  saleId?: string;
  description: string;
  amount: number;
  dueDate: string;
  receivedDate?: string;
  status: AccountStatus;
  installment: string; // ex: 1/3
}

export interface Invoice {
  id: string;
  saleId: string;
  invoiceNumber: string;
  series: string;
  model: '65' | '55'; // 65 = NFC-e, 55 = NF-e
  accessKey: string;
  environment: 'HOMOLOGACAO' | 'PRODUCAO';
  protocol: string;
  emissionDate: string;
  status: 'AUTORIZADA' | 'CANCELADA' | 'INUTILIZADA' | 'REJEITADA';
  digestValue: string;
  xmlUrl?: string;
  qrCodeUrl: string;
  totalAmount: number;
  customerName?: string;
  customerCpfCnpj?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}
