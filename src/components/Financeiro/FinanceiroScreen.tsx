import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { AccountPayable, AccountReceivable, Sale } from '../../types';

export const FinanceiroScreen: React.FC = () => {
  const [payables, setPayables] = useState<AccountPayable[]>(StorageService.getAccountsPayable());
  const [receivables, setReceivables] = useState<AccountReceivable[]>(StorageService.getAccountsReceivable());
  const sales = StorageService.getSales();
  const [activeTab, setActiveTab] = useState<'DRE' | 'PAGAR' | 'RECEBER'>('DRE');

  const refreshData = () => {
    setPayables(StorageService.getAccountsPayable());
    setReceivables(StorageService.getAccountsReceivable());
  };

  const handlePayAccount = (id: string) => {
    if (confirm('Confirmar o pagamento desta despesa/título?')) {
      StorageService.markAccountPayableAsPaid(id, 'Transferência Pix / Caixa');
      refreshData();
    }
  };

  const handleReceiveAccount = (id: string) => {
    if (confirm('Confirmar o recebimento deste valor do cliente?')) {
      StorageService.markAccountReceivableAsReceived(id);
      refreshData();
    }
  };

  // Cálculos DRE Comercial
  const receitaBruta = sales
    .filter(s => s.status === 'CONCLUIDA')
    .reduce((acc, curr) => acc + curr.total, 0);

  const impostosDeducoes = receitaBruta * 0.085; // Alíquota Simples Nacional ~8.5%
  const receitaLiquida = receitaBruta - impostosDeducoes;
  const cmv = receitaBruta * 0.58; // Custo médio das mercadorias vendidas (~58%)
  const lucroBruto = receitaLiquida - cmv;

  const totalDespesasPagas = payables
    .filter(p => p.status === 'PAGO')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalContasAPagarPendentes = payables
    .filter(p => p.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalContasAReceberPendentes = receivables
    .filter(r => r.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const resultadoOperacional = lucroBruto - totalDespesasPagas;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-yellow-400" />
            <span>Gestão Financeira & DRE Comercial</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Contas a pagar, contas a receber, conciliação de faturamento, margem e DRE simplificado.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('DRE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'DRE'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DRE & Resultados
          </button>
          <button
            onClick={() => setActiveTab('PAGAR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'PAGAR'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Contas a Pagar ({payables.filter(p => p.status === 'PENDENTE').length})
          </button>
          <button
            onClick={() => setActiveTab('RECEBER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'RECEBER'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Contas a Receber ({receivables.filter(r => r.status === 'PENDENTE').length})
          </button>
        </div>
      </div>

      {/* KPI Cards Financeiros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Receita Bruta (Vendas)</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            R$ {receitaBruta.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Contas a Pagar (Aberto)</span>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">
            R$ {totalContasAPagarPendentes.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Contas a Receber (Aberto)</span>
          <div className="text-2xl font-black font-mono text-teal-300 mt-1">
            R$ {totalContasAReceberPendentes.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Lucro Operacional Estimado</span>
          <div className={`text-2xl font-black font-mono mt-1 ${resultadoOperacional >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            R$ {resultadoOperacional.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Conteúdo da Aba DRE */}
      {activeTab === 'DRE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-yellow-400" />
              <span>Demonstrativo do Resultado do Exercício (DRE Gerencial Sintético)</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Regime de Competência</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg">
              <span className="text-slate-200 font-bold">(+) RECEITA BRUTA DE VENDAS</span>
              <span className="text-emerald-400 font-bold">R$ {receitaBruta.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg text-rose-300">
              <span>(-) Deduções da Receita Bruta (Simples Nacional ~8.5%)</span>
              <span>- R$ {impostosDeducoes.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-850 rounded-lg font-bold text-white border-l-4 border-cyan-500">
              <span>(=) RECEITA OPERACIONAL LÍQUIDA</span>
              <span>R$ {receitaLiquida.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg text-rose-400">
              <span>(-) Custo das Mercadorias Vendidas (CMV Médio 58%)</span>
              <span>- R$ {cmv.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-850 rounded-lg font-bold text-emerald-300 border-l-4 border-emerald-500">
              <span>(=) LUCRO BRUTO COMERCIAL</span>
              <span>R$ {lucroBruto.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg text-amber-300">
              <span>(-) Despesas Operacionais e Financeiras Liquidadas</span>
              <span>- R$ {totalDespesasPagas.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl font-black text-sm text-emerald-400">
              <span>(=) RESULTADO LÍQUIDO DO PERÍODO</span>
              <span>R$ {resultadoOperacional.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba Contas a Pagar */}
      {activeTab === 'PAGAR' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Contas a Pagar (Fornecedores e Despesas)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-right">Valor (R$)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payables.map((ap) => (
                  <tr key={ap.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{ap.supplierName}</td>
                    <td className="py-3 px-4 text-slate-300">{ap.description}</td>
                    <td className="py-3 px-4 text-slate-400">{ap.category}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{ap.dueDate}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      R$ {ap.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ap.status === 'PAGO'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {ap.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ap.status === 'PENDENTE' && (
                        <button
                          onClick={() => handlePayAccount(ap.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                        >
                          Liquidar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba Contas a Receber */}
      {activeTab === 'RECEBER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Contas a Receber (Vendas no Crediário e Títulos)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Parcela</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-right">Valor (R$)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {receivables.map((ar) => (
                  <tr key={ar.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{ar.customerName}</td>
                    <td className="py-3 px-4 text-slate-300">{ar.description}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{ar.installment}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{ar.dueDate}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-teal-300">
                      R$ {ar.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ar.status === 'PAGO'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {ar.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ar.status === 'PENDENTE' && (
                        <button
                          onClick={() => handleReceiveAccount(ar.id)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-bold"
                        >
                          Receber
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
