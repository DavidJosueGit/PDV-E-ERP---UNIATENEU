import React, { useState } from 'react';
import {
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Plus,
  History,
  TrendingDown,
  X,
  CheckCircle2,
  Package
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Product, StockMovement, MovementType } from '../../types';

export const EstoqueScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [movements, setMovements] = useState<StockMovement[]>(StorageService.getStockMovements());
  const currentUser = StorageService.getCurrentUser();

  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [movementType, setMovementType] = useState<MovementType>('ENTRADA');
  const [quantity, setQuantity] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(5.0);
  const [reason, setReason] = useState<string>('Recebimento de mercadoria com Nota Fiscal');

  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setMovements(StorageService.getStockMovements());
  };

  // Cálculos de KPIs
  const totalStockItems = products.reduce((acc, curr) => acc + curr.currentStock, 0);
  const totalCostValue = products.reduce((acc, curr) => acc + (curr.currentStock * curr.costPrice), 0);
  const totalRetailValue = products.reduce((acc, curr) => acc + (curr.currentStock * curr.salePrice), 0);
  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;

  const handleOpenMovement = (productId?: string, type: MovementType = 'ENTRADA') => {
    const prod = products.find(p => p.id === productId) || products[0];
    if (prod) {
      setSelectedProductId(prod.id);
      setUnitCost(prod.costPrice);
    }
    setMovementType(type);
    setQuantity(5);
    setReason(
      type === 'ENTRADA'
        ? 'Compra de reposição de estoque'
        : type === 'PERDA_AVARIA'
        ? 'Item quebrado / danificado no estoque'
        : 'Ajuste de inventário periódico'
    );
    setShowMovementModal(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (quantity <= 0) {
      alert('Informe uma quantidade válida maior que zero.');
      return;
    }

    const newMovement: StockMovement = {
      id: 'mov-' + Date.now(),
      productId: product.id,
      productName: product.name,
      type: movementType,
      quantity,
      unitPrice: unitCost,
      totalValue: quantity * unitCost,
      reason,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
    };

    StorageService.addStockMovement(newMovement);
    refreshData();
    setShowMovementModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            <span>Controle de Estoque & Movimentações</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rastreamento de entradas por compra, saídas por venda ou avaria, ajustes de inventário e alerta de ruptura.
          </p>
        </div>

        <button
          onClick={() => handleOpenMovement()}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-900/40"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Movimentação Manual</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total em Unidades</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {totalStockItems} <span className="text-xs font-normal text-slate-500">itens</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Valor em Custo</span>
          <div className="text-2xl font-black font-mono text-slate-300 mt-1">
            R$ {totalCostValue.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Potencial de Venda</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            R$ {totalRetailValue.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Alertas de Estoque Baixo</span>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1 flex items-center gap-2">
            {lowStockCount}
            {lowStockCount > 0 && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-sans">Atenção</span>}
          </div>
        </div>
      </div>

      {/* Seção Alerta de Ruptura de Estoque */}
      {lowStockCount > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-2xl">
          <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Produtos em Nível Crítico / Abaixo do Estoque Mínimo ({lowStockCount})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products
              .filter(p => p.currentStock <= p.minStock)
              .map(p => (
                <div key={p.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Atual: <strong className="text-rose-400">{p.currentStock} {p.unit}</strong> • Mínimo: {p.minStock} {p.unit}
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenMovement(p.id, 'ENTRADA')}
                    className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded text-xs font-semibold"
                  >
                    Repor
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tabela de Histórico de Movimentações */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Extrato e Rastreabilidade de Movimentações de Estoque</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/80 text-slate-400 font-semibold">
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4 text-center">Quantidade</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4">Motivo / Documento</th>
                <th className="py-3 px-4">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(m.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        m.type === 'ENTRADA'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : m.type === 'SAIDA'
                          ? 'bg-blue-500/20 text-blue-300'
                          : m.type === 'PERDA_AVARIA'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {m.type === 'ENTRADA' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {m.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{m.productName}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                    {m.quantity}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-300">
                    R$ {m.totalValue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{m.reason}</td>
                  <td className="py-3 px-4 text-slate-400">{m.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Movimentação Manual */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-white">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Lançamento de Movimentação no Estoque</span>
              </h2>
              <button onClick={() => setShowMovementModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Selecione o Produto:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) setUnitCost(p.costPrice);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Atual: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo de Movimentação:</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value as MovementType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="ENTRADA">ENTRADA (Compra/Reposição)</option>
                    <option value="SAIDA">SAÍDA (Amostra/Uso interno)</option>
                    <option value="AJUSTE">AJUSTE (Balanço Físico)</option>
                    <option value="PERDA_AVARIA">PERDA / AVARIA (Descarte)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Quantidade:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Motivo / Justificativa / Documento Fiscal:</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: NF-e 99281 de compra de mercadorias"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-amber-900/40"
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
