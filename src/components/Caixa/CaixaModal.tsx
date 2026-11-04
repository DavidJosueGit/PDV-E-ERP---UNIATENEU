import React, { useState } from 'react';
import {
  Banknote,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Printer,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { CashRegister, CashMovement } from '../../types';
import { StorageService } from '../../services/storage';

interface CaixaModalProps {
  cashRegister: CashRegister | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const CaixaModal: React.FC<CaixaModalProps> = ({
  cashRegister,
  onClose,
  onUpdated,
}) => {
  const currentUser = StorageService.getCurrentUser();
  const [initialBalance, setInitialBalance] = useState<number>(150);
  const [terminalNumber, setTerminalNumber] = useState<number>(1);
  const [closingNotes, setClosingNotes] = useState<string>('');

  const isAberto = cashRegister && cashRegister.status === 'ABERTO';

  const handleOpenCaixa = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      StorageService.openCashRegister(initialBalance, terminalNumber);
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCloseCaixa = () => {
    if (!cashRegister) return;
    if (confirm(`Confirmar o FECHAMENTO do Caixa #${cashRegister.terminalNumber} com saldo apurado de R$ ${cashRegister.currentBalance.toFixed(2)}?`)) {
      try {
        StorageService.closeCashRegister(cashRegister.id, closingNotes);
        onUpdated();
        onClose();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isAberto ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">
                {isAberto ? `Gestão do Caixa #${cashRegister.terminalNumber} (ABERTO)` : 'Abertura de Caixa do Terminal'}
              </h2>
              <p className="text-xs text-slate-400">Operador: {currentUser.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-4">
          {!isAberto ? (
            /* Formulário de Abertura */
            <form onSubmit={handleOpenCaixa} className="space-y-4">
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-200">
                Informe o valor inicial de dinheiro (Fundo de Troco) para abrir as operações do caixa no terminal.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Número do Terminal (PDV):</label>
                  <input
                    type="number"
                    min="1"
                    value={terminalNumber}
                    onChange={(e) => setTerminalNumber(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fundo de Troco Inicial (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-emerald-500 rounded-lg p-2.5 text-white font-mono font-bold text-base"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>CONFIRMAR ABERTURA DE CAIXA</span>
              </button>
            </form>
          ) : (
            /* Resumo e Fechamento de Caixa */
            <div className="space-y-4">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase block">Fundo Inicial:</span>
                  <span className="text-sm font-mono font-bold text-slate-200">
                    R$ {cashRegister.initialBalance.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase block">Total de Vendas:</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    R$ {cashRegister.totalSales.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase block">Saldo em Dinheiro:</span>
                  <span className="text-sm font-mono font-bold text-teal-300">
                    R$ {cashRegister.currentBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Detalhamento por Forma de Pagamento */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Total de Vendas por Meio de Pagamento
                </span>
                <div className="space-y-2 text-xs">
                  {Object.entries(cashRegister.paymentsBreakdown).map(([method, amount]) => (
                    <div key={method} className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-300">{method}</span>
                      <span className="font-mono font-bold text-white">R$ {amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-rose-400 py-1">
                    <span>Total Sangrias (Retiradas):</span>
                    <span className="font-mono">- R$ {cashRegister.totalSangria.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-teal-400 py-1">
                    <span>Total Suprimentos (Aportes):</span>
                    <span className="font-mono">+ R$ {cashRegister.totalSuprimento.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Observações do Fechamento:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Turno encerrado sem divergências de troco."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleCloseCaixa}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>CONFIRMAR FECHAMENTO DE CAIXA</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SangriaModalProps {
  cashRegister: CashRegister;
  onClose: () => void;
  onUpdated: () => void;
}

export const SangriaSuprimentoModal: React.FC<SangriaModalProps> = ({
  cashRegister,
  onClose,
  onUpdated,
}) => {
  const [type, setType] = useState<'SANGRIA' | 'SUPRIMENTO'>('SANGRIA');
  const [amount, setAmount] = useState<number>(50);
  const [reason, setReason] = useState<string>('Sangria para depósito em cofre central');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    try {
      StorageService.addCashMovement(cashRegister.id, type, amount, reason);
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            {type === 'SANGRIA' ? (
              <ArrowDownRight className="w-5 h-5 text-rose-400" />
            ) : (
              <ArrowUpRight className="w-5 h-5 text-teal-400" />
            )}
            <h2 className="font-bold text-base">Movimentação de Caixa Manual</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('SANGRIA');
                setReason('Sangria para cofre de segurança');
              }}
              className={`p-2.5 rounded-lg text-xs font-bold border transition-colors ${
                type === 'SANGRIA'
                  ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              SANGRIA (Retirada)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('SUPRIMENTO');
                setReason('Aporte complementar de moedas para troco');
              }}
              className={`p-2.5 rounded-lg text-xs font-bold border transition-colors ${
                type === 'SUPRIMENTO'
                  ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              SUPRIMENTO (Entrada)
            </button>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg text-xs flex justify-between border border-slate-800">
            <span className="text-slate-400">Saldo atual em dinheiro no caixa:</span>
            <span className="font-mono font-bold text-emerald-400">
              R$ {cashRegister.currentBalance.toFixed(2)}
            </span>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Valor da Operação (R$):</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-base"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Motivo / Justificativa:</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-colors shadow-lg ${
              type === 'SANGRIA' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-teal-600 hover:bg-teal-500'
            }`}
          >
            CONFIRMAR {type} DE R$ {amount.toFixed(2)}
          </button>
        </form>
      </div>
    </div>
  );
};
