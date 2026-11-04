import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldCheck,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Invoice, Sale } from '../../types';
import { FiscalService } from '../../services/fiscalAndTef';
import { ThermalReceiptModal } from '../PDV/ThermalReceiptModal';

export const FiscalScreen: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(StorageService.getInvoices());
  const [sales, setSales] = useState<Sale[]>(StorageService.getSales());
  const [sefazStatus, setSefazStatus] = useState<{ online: boolean; pingMs: number; message: string }>({
    online: true,
    pingMs: 142,
    message: 'Serviço em Operação (SEFAZ Autorizadora SP - v4.00)',
  });
  const [isCheckingSefaz, setIsCheckingSefaz] = useState(false);
  const [selectedInvoiceForDanfe, setSelectedInvoiceForDanfe] = useState<{ sale: Sale; invoice: Invoice } | null>(null);

  const handleCheckSefaz = () => {
    setIsCheckingSefaz(true);
    setTimeout(() => {
      setIsCheckingSefaz(false);
      setSefazStatus({
        online: true,
        pingMs: Math.floor(100 + Math.random() * 80),
        message: '107 - Serviço em Operação (SEFAZ SP Homologação)',
      });
    }, 1000);
  };

  const handleDownloadXml = (invoice: Invoice) => {
    const sale = sales.find(s => s.id === invoice.saleId);
    if (sale) {
      FiscalService.downloadXml(sale, invoice);
    } else {
      alert('Venda associada não encontrada para gerar XML completo.');
    }
  };

  const handleOpenDanfe = (invoice: Invoice) => {
    const sale = sales.find(s => s.id === invoice.saleId);
    if (sale) {
      setSelectedInvoiceForDanfe({ sale, invoice });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-rose-400" />
            <span>Módulo Fiscal — Emissão de NFC-e & NF-e</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de documentos fiscais eletrônicos integrados à SEFAZ, chave de acesso de 44 dígitos, XML 4.00 e DANFE.
          </p>
        </div>

        {/* Status SEFAZ */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">SEFAZ:</span>
            <span className="text-xs text-emerald-400 font-bold font-mono">{sefazStatus.pingMs}ms</span>
          </div>
          <button
            disabled={isCheckingSefaz}
            onClick={handleCheckSefaz}
            className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors"
            title="Consultar Status do Servidor SEFAZ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSefaz ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Notas Autorizadas</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {invoices.filter(i => i.status === 'AUTORIZADA').length}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Ambiente Fiscal</span>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-1 flex items-center gap-2">
            <span>HOMOLOGAÇÃO SEFAZ</span>
            <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">VERSÃO 4.00</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Certificado Digital</span>
          <div className="text-xs font-mono text-slate-300 mt-1">
            <span className="text-emerald-400 font-bold">A1 (ICP-Brasil) Válido</span>
            <div className="text-slate-500 text-[10px] mt-0.5">Expira em: 14/11/2026</div>
          </div>
        </div>
      </div>

      {/* Tabela de Notas Fiscais Emitidas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Documentos Fiscais Emitidos no PDV</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/80 text-slate-400 font-semibold">
                <th className="py-3 px-4">Número / Série</th>
                <th className="py-3 px-4">Modelo</th>
                <th className="py-3 px-4">Chave de Acesso SEFAZ (44 dígitos)</th>
                <th className="py-3 px-4">Emissão</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-center">Protocolo</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {inv.invoiceNumber} <span className="text-slate-500 font-normal">/ {inv.series}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px] text-slate-300 border border-slate-700">
                      Mod. {inv.model} ({inv.model === '65' ? 'NFC-e' : 'NF-e'})
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[10px]">
                    {inv.accessKey}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {new Date(inv.emissionDate).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    R$ {inv.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400 text-[10px]">
                    {inv.protocol}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inv.status === 'AUTORIZADA'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenDanfe(inv)}
                        className="p-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded transition-colors"
                        title="Visualizar Cupom / DANFE"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadXml(inv)}
                        className="p-1 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded transition-colors"
                        title="Baixar Arquivo XML (Layout 4.00)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal DANFE ao clicar em imprimir */}
      {selectedInvoiceForDanfe && (
        <ThermalReceiptModal
          sale={selectedInvoiceForDanfe.sale}
          invoice={selectedInvoiceForDanfe.invoice}
          onClose={() => setSelectedInvoiceForDanfe(null)}
        />
      )}
    </div>
  );
};
