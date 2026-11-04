import React, { useState } from 'react';
import {
  Banknote,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Unlock,
  Printer,
  History,
  AlertCircle
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { CashRegister, CashMovement } from '../../types';

interface CaixaScreenProps {
  onOpenCaixaModal: () => void;
  onOpenSangriaModal: () => void;
}

export const CaixaScreen: React.FC<CaixaScreenProps> = ({
  onOpenCaixaModal,
  onOpenSangriaModal,
}) => {
  const activeCash = StorageService.getActiveCashRegister();
  const allMovements = StorageService.getCashMovements();
  const allRegisters = StorageService.getDatabase().cashRegisters;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Banknote className="w-6 h-6 text-teal-400" />
            <span>Gestão de Caixa & Turnos Operacionais</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle de abertura, fechamento, conciliação de valores, sangrias e suprimentos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeCash && (
            <button
              onClick={onOpenSangriaModal}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
              <span>Sangria / Suprimento</span>
            </button>
          )}

          <button
            onClick={onOpenCaixaModal}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
              activeCash
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            {activeCash ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Fechamento de Caixa</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Abrir Novo Turno de Caixa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Caixa Ativo */}
      {activeCash ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Terminal #{activeCash.terminalNumber} • Turno em Andamento</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                    STATUS: ABERTO
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Operador: <strong className="text-slate-200">{activeCash.operatorName}</strong></span>
                  <span>•</span>
                  <span>Aberto às: {new Date(activeCash.openedAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Imprimir Espelho de Caixa</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Fundo de Troco Inicial</span>
              <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                R$ {activeCash.initialBalance.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total de Vendas</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                R$ {activeCash.totalSales.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Sangrias</span>
              <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                - R$ {activeCash.totalSangria.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Saldo Atual em Dinheiro</span>
              <div className="text-xl font-bold font-mono text-teal-300 mt-1">
                R$ {activeCash.currentBalance.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Vendas Liquidadas por Forma de Pagamento
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(activeCash.paymentsBreakdown).map(([method, amount]) => (
                <div key={method} className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">{method}</span>
                  <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                    R$ {amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Lock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white">Nenhum Caixa Aberto no Momento</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Para iniciar o atendimento no PDV e registrar vendas, abra um novo turno informando o fundo de troco.
          </p>
          <button
            onClick={onOpenCaixaModal}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
          >
            Abrir Caixa Agora
          </button>
        </div>
      )}

      {/* Histórico de Movimentações de Dinheiro (Sangria / Suprimento / Abertura) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-cyan-400" />
          <span>Extrato de Movimentações de Caixa (Sangrias e Suprimentos)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Data/Hora</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Operador</th>
                <th className="py-2.5 px-3">Motivo / Descrição</th>
                <th className="py-2.5 px-3 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {allMovements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 font-mono">
                    {new Date(m.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
                        m.type === 'SANGRIA'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-teal-500/20 text-teal-300'
                      }`}
                    >
                      {m.type === 'SANGRIA' ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                      {m.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{m.userName}</td>
                  <td className="py-2.5 px-3 text-slate-300">{m.reason}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                    R$ {m.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
