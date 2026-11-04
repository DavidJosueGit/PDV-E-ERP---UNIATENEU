import React, { useState } from 'react';
import {
  CreditCard,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  ShieldCheck,
  RotateCcw,
  Terminal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TefPaymentService } from '../../services/fiscalAndTef';

export const TefScreen: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<'STONE' | 'CIELO' | 'MERCADO_PAGO'>('STONE');
  const [method, setMethod] = useState<'CARTAO_CREDITO' | 'CARTAO_DEBITO'>('CARTAO_CREDITO');
  const [testAmount, setTestAmount] = useState<number>(49.90);
  const [installments, setInstallments] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tefResult, setTefResult] = useState<any | null>(null);

  const [transactions, setTransactions] = useState<any[]>([
    {
      id: 'tef-1',
      acquirer: 'Stone Pagamentos',
      brand: 'MASTERCARD',
      method: 'CARTAO_CREDITO',
      amount: 45.70,
      installments: 1,
      nsu: '928371',
      authCode: '482910',
      timestamp: '2025-02-03T11:24:00Z',
      status: 'APROVADA',
    },
    {
      id: 'tef-2',
      acquirer: 'Cielo Brasil',
      brand: 'VISA',
      method: 'CARTAO_DEBITO',
      amount: 112.50,
      installments: 1,
      nsu: '881294',
      authCode: '194029',
      timestamp: '2025-02-02T16:10:00Z',
      status: 'APROVADA',
    }
  ]);

  const handleSimulateTransaction = async () => {
    setIsProcessing(true);
    setTefResult(null);
    try {
      const res = await TefPaymentService.processCardPayment(
        method,
        testAmount,
        installments,
        selectedProvider === 'STONE' ? 'STONE_TEF' : selectedProvider === 'CIELO' ? 'CIELO' : 'MERCADO_PAGO'
      );
      setTefResult(res);

      setTransactions(prev => [
        {
          id: 'tef-' + Date.now(),
          acquirer: res.acquirer,
          brand: res.cardBrand,
          method,
          amount: testAmount,
          installments,
          nsu: res.nsu,
          authCode: res.authorizationCode,
          timestamp: new Date().toISOString(),
          status: 'APROVADA',
        },
        ...prev
      ]);
    } catch (err: any) {
      alert('Erro na transação: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = (nsu: string) => {
    if (confirm(`Deseja solicitar o estorno e cancelamento da transação TEF com NSU ${nsu}?`)) {
      setTransactions(prev =>
        prev.map(t => (t.nsu === nsu ? { ...t, status: 'ESTORNADA' } : t))
      );
      alert(`Transação NSU ${nsu} estornada com sucesso junto à adquirente.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <span>Integração TEF & Terminais de Pagamento</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Arquitetura multisserviço para máquinas de cartão, Pinpads USB/IP, conciliação e autorização bancária.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <Cpu className="w-4 h-4 text-emerald-400" />
            GERENCIADOR TEF: ATIVO (PORTA 4096)
          </span>
        </div>
      </div>

      {/* Provedores Suportados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedProvider('STONE')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedProvider === 'STONE'
              ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white text-sm">Stone TEF / Microvix</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono">CONECTADO</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Comunicação via DLL nativa e WebSockets com terminal PINPAD Gertec PPC930 / Verifone VX820.
          </p>
        </div>

        <div
          onClick={() => setSelectedProvider('CIELO')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedProvider === 'CIELO'
              ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-xl'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white text-sm">Cielo LIO / Premia</span>
            <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono">CONECTADO</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            API REST com protocolo TLS 1.3, roteamento automático de bandeiras e parcelamento no emissor/loja.
          </p>
        </div>

        <div
          onClick={() => setSelectedProvider('MERCADO_PAGO')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedProvider === 'MERCADO_PAGO'
              ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xl'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white text-sm">Mercado Pago Point</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.5 rounded font-mono">STANDBY</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Integração Point Pro 2 via Device ID com Webhook de autorização em tempo real.
          </p>
        </div>
      </div>

      {/* Simulador de Transação TEF */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Simulador & Teste de Transação no Terminal PINPAD</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tipo de Operação:</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
            >
              <option value="CARTAO_CREDITO">Cartão de Crédito</option>
              <option value="CARTAO_DEBITO">Cartão de Débito</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Valor do Pagamento (R$):</label>
            <input
              type="number"
              step="0.01"
              value={testAmount}
              onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Parcelas:</label>
            <select
              disabled={method === 'CARTAO_DEBITO'}
              value={installments}
              onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white disabled:opacity-50"
            >
              <option value={1}>1x À Vista</option>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
              <option value={6}>6x</option>
              <option value={10}>10x</option>
              <option value={12}>12x</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              disabled={isProcessing}
              onClick={handleSimulateTransaction}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Comunicando com PINPAD...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Enviar para PINPAD</span>
                </>
              )}
            </button>
          </div>
        </div>

        {tefResult && (
          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>TRANSAÇÃO AUTORIZADA COM SUCESSO!</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
              <div>Adquirente: <strong className="text-white">{tefResult.acquirer}</strong></div>
              <div>Bandeira: <strong className="text-white">{tefResult.cardBrand}</strong></div>
              <div>NSU: <strong className="text-white">{tefResult.nsu}</strong></div>
              <div>Cód. Autorização: <strong className="text-white">{tefResult.authorizationCode}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Histórico de Transações de Cartão */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Extrato de Transações Eletrônicas de Fundos (TEF)</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/80 text-slate-400 font-semibold">
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Adquirente</th>
                <th className="py-3 px-4">Bandeira / Modalidade</th>
                <th className="py-3 px-4 text-center">NSU</th>
                <th className="py-3 px-4 text-center">Cód. Aut</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(t.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{t.acquirer}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {t.brand} • {t.method === 'CARTAO_CREDITO' ? `Crédito (${t.installments}x)` : 'Débito à vista'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">{t.nsu}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">{t.authCode}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    R$ {t.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        t.status === 'APROVADA'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {t.status === 'APROVADA' && (
                      <button
                        onClick={() => handleRefund(t.nsu)}
                        className="text-xs text-rose-400 hover:text-rose-300 underline font-medium"
                      >
                        Estornar
                      </button>
                    )}
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
