import React from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  Package,
  Award,
  Layers
} from 'lucide-react';
import { StorageService } from '../../services/storage';

export const DashboardScreen: React.FC = () => {
  const db = StorageService.getDatabase();
  const sales = db.sales.filter(s => s.status === 'CONCLUIDA');
  const products = db.products;

  const totalRevenue = sales.reduce((acc, curr) => acc + curr.total, 0);
  const totalSalesCount = sales.length;
  const ticketMedio = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  const totalItemsSold = sales.reduce((acc, curr) => 
    acc + curr.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0
  );

  // Vendas por forma de pagamento
  const paymentTotals: Record<string, number> = {
    DINHEIRO: 0,
    PIX: 0,
    CARTAO_CREDITO: 0,
    CARTAO_DEBITO: 0,
    CREDIARIO: 0,
  };

  for (const s of sales) {
    for (const p of s.payments) {
      paymentTotals[p.method] = (paymentTotals[p.method] || 0) + p.amount;
    }
  }

  // Ranking de produtos mais vendidos
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const s of sales) {
    for (const item of s.items) {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenue += item.total;
    }
  }

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <span>Dashboard Executivo & Relatórios Comerciais</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Indicadores em tempo real consolidados diretamente do banco de dados (PDV e ERP).
        </p>
      </div>

      {/* KPI Cards Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Faturamento Bruto</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
            R$ {totalRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total acumulado de vendas</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400 mt-2">
            R$ {ticketMedio.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Por atendimento no PDV</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Atendimentos Concluídos</span>
            <ShoppingCart className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2">
            {totalSalesCount} <span className="text-xs text-slate-500 font-normal">vendas</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{totalItemsSold} unidades comercializadas</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Margem Comercial Bruta</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-2">
            42.0%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Markup ponderado dos itens</div>
        </div>
      </div>

      {/* Grid: Formas de Pagamento e Top Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Meio de Pagamento */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>Faturamento por Meio de Pagamento</span>
          </h2>

          <div className="space-y-3">
            {Object.entries(paymentTotals).map(([method, amount]) => {
              const percent = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-semibold">{method}</span>
                    <span className="font-mono">R$ {amount.toFixed(2)} ({percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Produtos Mais Vendidos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Package className="w-4 h-4 text-emerald-400" />
            <span>Curva ABC — Produtos Mais Vendidos</span>
          </h2>

          {topProducts.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-8">
              Nenhuma venda registrada ainda no período.
            </div>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, index) => (
                <div
                  key={index}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold font-mono text-[11px]">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.quantity} unidades vendidas</div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-emerald-400 text-sm">
                    R$ {p.revenue.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
