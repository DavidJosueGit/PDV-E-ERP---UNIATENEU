import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Percent,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  HelpCircle,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Tag
} from 'lucide-react';
import { Product, CartItem, Sale, Invoice, CashRegister } from '../../types';
import { StorageService } from '../../services/storage';
import { PaymentModal } from './PaymentModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';

interface PdvScreenProps {
  cashRegister: CashRegister | null;
  onOpenCashModal: () => void;
  onOpenSangriaModal: () => void;
}

export const PdvScreen: React.FC<PdvScreenProps> = ({
  cashRegister,
  onOpenCashModal,
  onOpenSangriaModal,
}) => {
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [categories, setCategories] = useState(StorageService.getCategories());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Input do leitor de código de barras
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);

  // Carrinho
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [additionTotal, setAdditionTotal] = useState<number>(0);

  // Modais de Finalização
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<{ sale: Sale; invoice: Invoice } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Manter foco no leitor de código de barras
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [showPaymentModal, completedSale, showSearchModal]);

  // Teclas de Atalho Globais do PDV
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowHelpModal(prev => !prev);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) setShowDiscountModal(prev => !prev);
      } else if (e.key === 'F7') {
        e.preventDefault();
        onOpenSangriaModal();
      } else if (e.key === 'F8') {
        e.preventDefault();
        onOpenCashModal();
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0 && confirm('Deseja realmente cancelar todos os itens da venda atual?')) {
          setCart([]);
        }
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (cart.length > 0 && (!cashRegister || cashRegister.status === 'ABERTO')) {
          setShowPaymentModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, cashRegister, onOpenCashModal, onOpenSangriaModal]);

  // Adicionar produto por código de barras ou formato QTD*CODIGO
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    let quantity = 1;
    let code = barcodeInput.trim();

    // Suporta digitação de multiplicador: Ex: "3*7894900011517"
    if (code.includes('*')) {
      const parts = code.split('*');
      quantity = parseFloat(parts[0]) || 1;
      code = parts[1] || '';
    }

    const found = products.find(
      p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      addToCart(found, quantity);
      setBarcodeInput('');
    } else {
      alert(`Produto com código ou SKU "${code}" não foi encontrado!`);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (!cashRegister || cashRegister.status !== 'ABERTO') {
      alert('Atenção: O caixa está fechado! Abra o caixa antes de iniciar vendas.');
      return;
    }

    setCart(prev => {
      const index = prev.findIndex(item => item.product.id === product.id);
      if (index >= 0) {
        const next = [...prev];
        const newQty = next[index].quantity + quantity;
        next[index].quantity = newQty;
        next[index].total = newQty * next[index].unitPrice - next[index].discount;
        return next;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            unitPrice: product.salePrice,
            discount: 0,
            total: quantity * product.salePrice,
          }
        ];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = Math.max(1, item.quantity + delta);
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unitPrice - item.discount,
            };
          }
          return item;
        });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Cálculos de totais
  const subtotal = cart.reduce((acc, curr) => acc + curr.total, 0);
  const discountTotal = (subtotal * discountPercent) / 100;
  const grandTotal = Math.max(0, subtotal - discountTotal + additionTotal);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.barcode.includes(searchFilter) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Barra Superior de Teclas de Atalho */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 overflow-x-auto shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <kbd className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">F1</kbd> Ajuda
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">F2</kbd> Buscar Produto
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">F4</kbd> Desconto
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">F7</kbd> Sangria/Suprimento
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">F8</kbd> Caixa
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <kbd className="bg-slate-800 text-rose-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">F9</kbd> Cancelar Venda
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <kbd className="bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 font-mono">F10</kbd> Finalizar Venda
          </span>
        </div>
      </div>

      {/* Alerta de Caixa Fechado */}
      {(!cashRegister || cashRegister.status !== 'ABERTO') && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-2 flex items-center justify-between text-rose-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">O caixa deste terminal encontra-se fechado. Para registrar vendas e emitir NFC-e, abra o caixa primeiro.</span>
          </div>
          <button
            onClick={onOpenCashModal}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs transition-colors"
          >
            Abrir Caixa Agora (F8)
          </button>
        </div>
      )}

      {/* Grid Principal do PDV */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Lado Esquerdo: Leitor de Código de Barras + Catálogo Rápido */}
        <div className="lg:col-span-7 flex flex-col border-r border-slate-800 p-3 overflow-hidden bg-slate-900/40">
          {/* Campo de Leitura Rápida de Código de Barras */}
          <form onSubmit={handleBarcodeSubmit} className="mb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Barcode className="w-5 h-5 text-emerald-400" />
              </div>
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Escaneie o código de barras ou digite (Ex: 7894900011517 ou 2*REF-CC2L) e tecle ENTER..."
                className="w-full pl-11 pr-28 py-3 bg-slate-900 border-2 border-emerald-500/60 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          {/* Categorias Rápidas */}
          <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 shrink-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Todos os Produtos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Grid de Produtos para Toque / Clique Rápido */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filteredProducts.map((p) => {
              const isLowStock = p.currentStock <= p.minStock;
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p, 1)}
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 p-2.5 rounded-xl text-left flex flex-col justify-between transition-all group shadow-sm active:scale-95"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-mono">{p.sku}</span>
                      <span className={`px-1.5 py-0.2 rounded font-semibold ${
                        isLowStock ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'
                      }`}>
                        Estoque: {p.currentStock}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white group-hover:text-emerald-300 line-clamp-2 leading-tight">
                      {p.name}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-750 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{p.unit}</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      R$ {p.salePrice.toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lado Direito: Carrinho de Compras & Totais da Venda */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 overflow-hidden">
          {/* Header da Venda Atual */}
          <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Cupom Fiscal Atual</span>
              <div className="text-xs text-slate-300 font-mono">
                {cart.length} {cart.length === 1 ? 'item' : 'itens'} no carrinho
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Cancelar toda a venda atual?')) setCart([]);
                }}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar (F9)</span>
              </button>
            )}
          </div>

          {/* Lista de Itens do Carrinho */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
                <Barcode className="w-16 h-16 text-slate-700 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-400">Caixa Livre • Aguardando Produtos</p>
                <p className="text-xs text-slate-600 mt-1">Escaneie o código de barras ou selecione ao lado para iniciar a venda.</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={item.product.id}
                  className="bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-700 text-slate-300 font-mono text-[10px] px-1 rounded">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-white text-xs">{item.product.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono text-emerald-400">R$ {item.unitPrice.toFixed(2)}</span> / {item.product.unit}
                    </div>
                  </div>

                  {/* Controles de Quantidade */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 hover:bg-slate-800 text-slate-300 rounded"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-white text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 hover:bg-slate-800 text-slate-300 rounded"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-20 text-right font-mono font-bold text-white text-sm">
                      R$ {item.total.toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Painel de Totais e Fechamento */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} itens):</span>
                <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Desconto ({discountPercent}%):</span>
                  <span className="font-mono">- R$ {discountTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Display do Total em Destaque */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold block">
                  Total da Venda
                </span>
                <span className="text-[11px] text-emerald-500/80">Tributos aprox.: 28.45%</span>
              </div>
              <div className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
                R$ {grandTotal.toFixed(2)}
              </div>
            </div>

            {/* Ações Inferiores */}
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={cart.length === 0}
                onClick={() => setShowDiscountModal(true)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Percent className="w-4 h-4 text-amber-400" />
                <span>Desconto (F4)</span>
              </button>

              <button
                disabled={cart.length === 0 || !cashRegister || cashRegister.status !== 'ABERTO'}
                onClick={() => setShowPaymentModal(true)}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>PAGAMENTO (F10)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Busca Rápida de Produtos (F2) */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Localizar Produto no Catálogo (F2)</span>
              </h3>
              <button onClick={() => setShowSearchModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-800">
              <input
                type="text"
                autoFocus
                placeholder="Digite o nome, código de barras ou SKU..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    addToCart(p, 1);
                    setShowSearchModal(false);
                  }}
                  className="p-3 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-bold text-white text-xs">{p.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      EAN: {p.barcode} • SKU: {p.sku} • Estoque: {p.currentStock} {p.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      R$ {p.salePrice.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400">Clique para adicionar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Desconto (F4) */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-400" />
              <span>Aplicar Desconto na Venda</span>
            </h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Percentual de Desconto (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold text-lg"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajuda de Teclas de Atalho (F1) */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>Teclas de Atalho do PDV Operacional</span>
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-300">Ajuda e Legenda</span>
                <kbd className="bg-slate-900 px-2 py-0.5 rounded text-cyan-400 font-mono">F1</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-300">Localizar Produto</span>
                <kbd className="bg-slate-900 px-2 py-0.5 rounded text-cyan-400 font-mono">F2</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-300">Aplicar Desconto na Venda</span>
                <kbd className="bg-slate-900 px-2 py-0.5 rounded text-cyan-400 font-mono">F4</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-300">Sangria / Suprimento de Caixa</span>
                <kbd className="bg-slate-900 px-2 py-0.5 rounded text-cyan-400 font-mono">F7</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-300">Abertura e Fechamento de Caixa</span>
                <kbd className="bg-slate-900 px-2 py-0.5 rounded text-cyan-400 font-mono">F8</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded text-rose-300">
                <span>Cancelar Venda Atual</span>
                <kbd className="bg-slate-900 px-2 py-0.5 rounded text-rose-400 font-mono">F9</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded text-emerald-300 font-bold">
                <span>Finalizar Venda / Pagamento</span>
                <kbd className="bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 font-mono">F10</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <PaymentModal
          cart={cart}
          subtotal={subtotal}
          discountTotal={discountTotal}
          additionTotal={additionTotal}
          total={grandTotal}
          onClose={() => setShowPaymentModal(false)}
          onComplete={(sale, invoice) => {
            setShowPaymentModal(false);
            setCart([]);
            setDiscountPercent(0);
            setProducts(StorageService.getProducts()); // atualizar estoque visual
            setCompletedSale({ sale, invoice });
          }}
        />
      )}

      {/* Modal de Cupom Térmico NFC-e Concluído */}
      {completedSale && (
        <ThermalReceiptModal
          sale={completedSale.sale}
          invoice={completedSale.invoice}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
};
