import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  QrCode,
  Users,
  CheckCircle2,
  X,
  AlertCircle,
  Plus,
  Trash2,
  Cpu,
  Loader2,
  Receipt
} from 'lucide-react';
import { PaymentMethod, PaymentItem, Customer, CartItem, Sale, Invoice } from '../../types';
import { StorageService } from '../../services/storage';
import { TefPaymentService } from '../../services/fiscalAndTef';

interface PaymentModalProps {
  cart: CartItem[];
  subtotal: number;
  discountTotal: number;
  additionTotal: number;
  total: number;
  onClose: () => void;
  onComplete: (sale: Sale, invoice: Invoice) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  cart,
  subtotal,
  discountTotal,
  additionTotal,
  total,
  onClose,
  onComplete,
}) => {
  const customers = StorageService.getCustomers();
  const activeCash = StorageService.getActiveCashRegister();
  const currentUser = StorageService.getCurrentUser();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('DINHEIRO');
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [cashReceived, setCashReceived] = useState<number>(total);
  const [installments, setInstallments] = useState<number>(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customCpfCnpj, setCustomCpfCnpj] = useState<string>('');
  
  // TEF process state
  const [isProcessingTef, setIsProcessingTef] = useState<boolean>(false);
  const [tefTerminal, setTefTerminal] = useState<'STONE_TEF' | 'CIELO' | 'MERCADO_PAGO'>('STONE_TEF');
  const [tefMessage, setTefMessage] = useState<string>('');
  
  // Pix QR Code state
  const [pixGenerated, setPixGenerated] = useState<boolean>(false);
  const [pixCountdown, setPixCountdown] = useState<number>(3);
  const [isProcessingPix, setIsProcessingPix] = useState<boolean>(false);

  // Totais parciais de pagamento
  const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = selectedMethod === 'DINHEIRO' && cashReceived > remaining ? cashReceived - remaining : 0;

  // Adicionar pagamento à lista (suporta pagamento múltiplo/dividido)
  const handleAddPayment = async () => {
    if (remaining <= 0) return;

    if (selectedMethod === 'DINHEIRO') {
      const amountToAdd = Math.min(cashReceived, remaining);
      const newPayment: PaymentItem = {
        id: 'pay-' + Date.now(),
        method: 'DINHEIRO',
        amount: amountToAdd,
        change: cashReceived > amountToAdd ? cashReceived - amountToAdd : 0,
      };
      setPayments([...payments, newPayment]);
      setCashReceived(Math.max(0, remaining - amountToAdd));
    } else if (selectedMethod === 'CARTAO_CREDITO' || selectedMethod === 'CARTAO_DEBITO') {
      // Processar TEF
      setIsProcessingTef(true);
      setTefMessage('Insira, aproxime ou passe o cartão no PINPAD...');
      try {
        const tefResult = await TefPaymentService.processCardPayment(
          selectedMethod,
          remaining,
          installments,
          tefTerminal
        );
        const newPayment: PaymentItem = {
          id: 'pay-' + Date.now(),
          method: selectedMethod,
          amount: remaining,
          installments: selectedMethod === 'CARTAO_CREDITO' ? installments : 1,
          tefNsu: tefResult.nsu,
          tefAuthCode: tefResult.authorizationCode,
          tefAcquirer: tefResult.acquirer,
        };
        setPayments([...payments, newPayment]);
      } catch (e: any) {
        alert('Falha na comunicação TEF: ' + e.message);
      } finally {
        setIsProcessingTef(false);
        setTefMessage('');
      }
    } else if (selectedMethod === 'PIX') {
      setIsProcessingPix(true);
      setPixGenerated(true);
      setPixCountdown(3);
      
      const interval = setInterval(() => {
        setPixCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsProcessingPix(false);
            const newPayment: PaymentItem = {
              id: 'pay-' + Date.now(),
              method: 'PIX',
              amount: remaining,
              tefAuthCode: 'PIX-' + Math.floor(10000000 + Math.random() * 90000000),
            };
            setPayments((curr) => [...curr, newPayment]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (selectedMethod === 'CREDIARIO') {
      if (!selectedCustomerId) {
        alert('Selecione um cliente cadastrado para vender no crediário!');
        return;
      }
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer && (customer.creditLimit - customer.creditUsed) < remaining) {
        alert(`Limite de crédito insuficiente! Disponível: R$ ${(customer.creditLimit - customer.creditUsed).toFixed(2)}`);
        return;
      }
      const newPayment: PaymentItem = {
        id: 'pay-' + Date.now(),
        method: 'CREDIARIO',
        amount: remaining,
      };
      setPayments([...payments, newPayment]);
    }
  };

  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  // Finalizar a venda
  const handleFinalizeSale = () => {
    if (!activeCash) {
      alert('Caixa fechado! Abra o caixa antes de realizar vendas.');
      return;
    }

    if (totalPaid < total) {
      alert(`Valor pendente de pagamento: R$ ${(total - totalPaid).toFixed(2)}`);
      return;
    }

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    const saleItems = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      barcode: item.product.barcode,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      total: item.total,
    }));

    try {
      const result = StorageService.completeSale({
        cashRegisterId: activeCash.id,
        operatorId: currentUser.id,
        operatorName: currentUser.name,
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer ? selectedCustomer.name : customCpfCnpj ? 'Consumidor Identificado' : 'Consumidor Final',
        customerCpfCnpj: selectedCustomer ? selectedCustomer.cpfCnpj : customCpfCnpj || undefined,
        items: saleItems,
        subtotal,
        discountTotal,
        additionTotal,
        total,
        payments,
        change: payments.reduce((acc, curr) => acc + (curr.change || 0), 0),
      });

      onComplete(result.sale, result.invoice);
    } catch (err: any) {
      alert('Erro ao finalizar venda: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Finalização de Venda & Pagamento</h2>
              <p className="text-xs text-slate-400">Total a Pagar: R$ {total.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto flex-1">
          {/* Coluna Esquerda: Escolha da Forma de Pagamento */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Selecione o Meio de Pagamento:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('DINHEIRO')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                    selectedMethod === 'DINHEIRO'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <span>Dinheiro (F1)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('PIX')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                    selectedMethod === 'PIX'
                      ? 'bg-teal-600/20 border-teal-500 text-teal-300 ring-2 ring-teal-500/30'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-teal-400" />
                  <span>PIX Instantâneo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('CARTAO_CREDITO')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                    selectedMethod === 'CARTAO_CREDITO'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/30'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span>Crédito (TEF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('CARTAO_DEBITO')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                    selectedMethod === 'CARTAO_DEBITO'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span>Débito (TEF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('CREDIARIO')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                    selectedMethod === 'CREDIARIO'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Crediário / A Prazo</span>
                </button>
              </div>
            </div>

            {/* Painel Específico da Forma Selecionada */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              {selectedMethod === 'DINHEIRO' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Valor em Dinheiro Recebido:</span>
                    <span className="text-xs text-slate-400">Restante a pagar: R$ {remaining.toFixed(2)}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-lg font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  {/* Botões Rápidos de Notas */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[remaining, 10, 20, 50, 100, 200].map((val, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashReceived(val)}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs rounded font-mono font-medium transition-colors border border-slate-600"
                      >
                        {idx === 0 ? 'Exato' : `R$ ${val}`}
                      </button>
                    ))}
                  </div>
                  {cashReceived > remaining && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg flex items-center justify-between text-emerald-300 font-bold">
                      <span className="text-xs uppercase">Troco Calculado:</span>
                      <span className="text-base font-mono">R$ {(cashReceived - remaining).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedMethod === 'PIX' && (
                <div className="text-center py-2 space-y-3">
                  <div className="inline-block p-3 bg-white rounded-xl shadow-lg">
                    <QrCode className="w-32 h-32 text-black mx-auto" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <div className="font-semibold text-teal-400">QR Code Pix Dinâmico Gerado</div>
                    <div className="text-slate-400 mt-0.5">Valor: R$ {remaining.toFixed(2)} • Chave Aleatória Banco Central</div>
                  </div>
                  {isProcessingPix ? (
                    <div className="flex items-center justify-center gap-2 text-teal-400 text-xs font-medium py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Aguardando confirmação do banco... ({pixCountdown}s)</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-700 font-mono break-all select-all">
                      00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540{remaining.toFixed(2)}5802BR5925NEXUS SUPERMERCADOS6009SAO PAULO62070503***6304ABCD
                    </div>
                  )}
                </div>
              )}

              {(selectedMethod === 'CARTAO_CREDITO' || selectedMethod === 'CARTAO_DEBITO') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Integração TEF Dedicado:</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" /> PINPAD Conectado (USB 01)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTefTerminal('STONE_TEF')}
                      className={`px-3 py-2 text-xs rounded-lg border text-center font-medium ${
                        tefTerminal === 'STONE_TEF'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Stone TEF
                    </button>
                    <button
                      type="button"
                      onClick={() => setTefTerminal('CIELO')}
                      className={`px-3 py-2 text-xs rounded-lg border text-center font-medium ${
                        tefTerminal === 'CIELO'
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Cielo LIO
                    </button>
                    <button
                      type="button"
                      onClick={() => setTefTerminal('MERCADO_PAGO')}
                      className={`px-3 py-2 text-xs rounded-lg border text-center font-medium ${
                        tefTerminal === 'MERCADO_PAGO'
                          ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Mercado Pago
                    </button>
                  </div>

                  {selectedMethod === 'CARTAO_CREDITO' && (
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Parcelamento:</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        <option value={1}>1x de R$ {remaining.toFixed(2)} (À vista sem juros)</option>
                        <option value={2}>2x de R$ {(remaining / 2).toFixed(2)}</option>
                        <option value={3}>3x de R$ {(remaining / 3).toFixed(2)}</option>
                        <option value={6}>6x de R$ {(remaining / 6).toFixed(2)}</option>
                        <option value={10}>10x de R$ {(remaining / 10).toFixed(2)}</option>
                        <option value={12}>12x de R$ {(remaining / 12).toFixed(2)}</option>
                      </select>
                    </div>
                  )}

                  {isProcessingTef && (
                    <div className="p-3 bg-blue-950/80 border border-blue-500/50 rounded-lg flex items-center gap-3 text-blue-300 text-xs animate-pulse">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      <span>{tefMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedMethod === 'CREDIARIO' && (
                <div className="space-y-3">
                  <label className="text-xs text-slate-300 block">Selecione o Cliente Cadastrado:</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">Selecione um cliente...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (CPF/CNPJ: {c.cpfCnpj}) - Limite Disp: R$ {(c.creditLimit - c.creditUsed).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2.5 rounded border border-amber-500/30">
                    O valor será lançado em Contas a Receber para vencimento em 30 dias.
                  </div>
                </div>
              )}

              {/* Botão de Adicionar Meio de Pagamento */}
              <button
                type="button"
                disabled={remaining <= 0 || isProcessingTef || isProcessingPix}
                onClick={handleAddPayment}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-650 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Pagamento de R$ {remaining.toFixed(2)}</span>
              </button>
            </div>

            {/* Identificação Opcional de CPF na Nota */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/80">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                CPF / CNPJ na NFC-e (Opcional para Nota Fiscal Paulista/Cidadã):
              </label>
              <input
                type="text"
                placeholder="Ex: 123.456.789-00 ou 00.000.000/0001-00"
                value={customCpfCnpj}
                onChange={(e) => setCustomCpfCnpj(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Coluna Direita: Resumo Financeiro & Pagamentos Lançados */}
          <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Resumo dos Valores
                </span>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-xs text-rose-400">
                    <span>Desconto Total:</span>
                    <span>- R$ {discountTotal.toFixed(2)}</span>
                  </div>
                )}
                {additionTotal > 0 && (
                  <div className="flex justify-between text-xs text-amber-400">
                    <span>Acréscimos:</span>
                    <span>+ R$ {additionTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-emerald-400 mt-2 pt-2 border-t border-slate-800">
                  <span>TOTAL DA VENDA:</span>
                  <span className="font-mono">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Lista de Pagamentos Lançados */}
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-2">
                  Pagamentos Adicionados ({payments.length}):
                </span>
                {payments.length === 0 ? (
                  <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-800 rounded-lg">
                    Nenhum meio de pagamento lançado ainda.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-200">
                            {p.method} {p.installments && p.installments > 1 ? `(${p.installments}x)` : ''}
                          </div>
                          {p.tefAuthCode && (
                            <div className="text-[10px] text-slate-400">
                              Aut: {p.tefAuthCode} • NSU: {p.tefNsu || 'LOCAL'}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">
                            R$ {p.amount.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePayment(p.id)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status do Saldo */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total Pago:</span>
                  <span className="font-mono text-slate-200 font-bold">R$ {totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Restante a Pagar:</span>
                  <span className={`font-mono font-bold ${remaining > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    R$ {remaining.toFixed(2)}
                  </span>
                </div>
                {change > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400 font-bold pt-1 border-t border-slate-800">
                    <span>Troco a Devolver:</span>
                    <span className="font-mono">R$ {change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botão Finalizar Venda */}
            <div className="pt-4 mt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={remaining > 0 || isProcessingTef || isProcessingPix}
                onClick={handleFinalizeSale}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONFIRMAR & EMITIR NFC-e (F10)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
