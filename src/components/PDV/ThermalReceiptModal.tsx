import React from 'react';
import { Printer, Download, X, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';
import { Sale, Invoice } from '../../types';
import { FiscalService } from '../../services/fiscalAndTef';

interface ThermalReceiptModalProps {
  sale: Sale;
  invoice: Invoice;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  sale,
  invoice,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    FiscalService.downloadXml(sale, invoice);
  };

  // Formata chave de 44 dígitos em grupos de 4
  const formatAccessKey = (key: string) => {
    return key.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-5 py-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm tracking-wide">Venda Concluída & NFC-e Autorizada</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cupom Térmico 80mm Container */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 flex justify-center">
          <div
            id="thermal-receipt"
            className="bg-white text-black p-5 rounded font-mono text-[11px] leading-relaxed w-full max-w-[340px] shadow-lg border border-slate-200"
          >
            {/* Cabeçalho */}
            <div className="text-center border-b border-dashed border-black pb-2 mb-2">
              <div className="font-bold text-xs uppercase">Nexus Comércio Varejista Ltda</div>
              <div>CNPJ: 12.345.678/0001-90</div>
              <div>IE: 112.233.445.566</div>
              <div>Av. Brasil, 1500 - Centro - São Paulo/SP</div>
              <div className="mt-1 font-bold text-[10px] tracking-widest border-t border-dotted border-gray-400 pt-1">
                DANFE NFC-e - DOCUMENTO AUXILIAR DA NOTA FISCAL DE CONSUMIDOR ELETRÔNICA
              </div>
              <div className="text-[9px] text-gray-700">Não permite aproveitamento de crédito de ICMS</div>
            </div>

            {/* Dados do Consumidor */}
            <div className="border-b border-dashed border-black pb-1 mb-2">
              <div>Consumidor: {sale.customerName || 'CONSUMIDOR PADRÃO NÃO IDENTIFICADO'}</div>
              {sale.customerCpfCnpj && <div>CPF/CNPJ: {sale.customerCpfCnpj}</div>}
            </div>

            {/* Lista de Itens */}
            <div className="border-b border-dashed border-black pb-2 mb-2">
              <div className="flex justify-between font-bold border-b border-dotted border-gray-400 pb-1 mb-1">
                <span>ITEM CÓD DESCRIÇÃO</span>
                <span>QTDxV.UN TOTAL</span>
              </div>
              {sale.items.map((item, index) => (
                <div key={item.productId} className="mb-1 text-[10px]">
                  <div className="font-semibold">
                    {String(index + 1).padStart(3, '0')} {item.sku} - {item.productName}
                  </div>
                  <div className="flex justify-between pl-4 text-gray-800">
                    <span>
                      {item.quantity} UN x R$ {item.unitPrice.toFixed(2)}
                      {item.discount > 0 && ` (Desc. R$ ${item.discount.toFixed(2)})`}
                    </span>
                    <span className="font-bold">R$ {item.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
              <div className="flex justify-between">
                <span>Qtd. Total de Itens:</span>
                <span className="font-bold">
                  {sale.items.reduce((acc, curr) => acc + curr.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discountTotal > 0 && (
                <div className="flex justify-between text-red-700">
                  <span>Desconto Total:</span>
                  <span>- R$ {sale.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-dotted border-gray-400">
                <span>VALOR TOTAL A PAGAR:</span>
                <span className="text-sm">R$ {sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Formas de Pagamento */}
            <div className="border-b border-dashed border-black pb-2 mb-2">
              <div className="font-bold mb-1">FORMA DE PAGAMENTO</div>
              {sale.payments.map((p) => (
                <div key={p.id} className="flex justify-between text-[10px]">
                  <span>{p.method} {p.installments && p.installments > 1 ? `(${p.installments}x)` : ''}:</span>
                  <span className="font-semibold">R$ {p.amount.toFixed(2)}</span>
                </div>
              ))}
              {sale.change > 0 && (
                <div className="flex justify-between font-bold text-[10px] mt-1 pt-1 border-t border-dotted border-gray-300">
                  <span>TROCO:</span>
                  <span>R$ {sale.change.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Tributos */}
            <div className="text-[9px] text-gray-700 border-b border-dashed border-black pb-2 mb-2">
              Informação dos Tributos Totais Incidentes (Lei Federal 12.741/2012):
              <div className="font-semibold">
                R$ {(sale.total * 0.2845).toFixed(2)} (Fed 13.45%, Est 15.00%)
              </div>
            </div>

            {/* Chave de Acesso e QR Code */}
            <div className="text-center pt-1">
              <div className="font-bold text-[10px]">NFC-e Nº {invoice.invoiceNumber} • SÉRIE {invoice.series}</div>
              <div className="text-[9px] text-gray-600">
                Emissão: {new Date(invoice.emissionDate).toLocaleString('pt-BR')}
              </div>
              <div className="text-[9px] font-semibold mt-1">PROTOCOLO DE AUTORIZAÇÃO:</div>
              <div className="text-[10px] font-bold text-emerald-800">{invoice.protocol}</div>

              <div className="my-2 border border-black p-1 text-[8px] break-all leading-tight">
                <div className="font-bold text-[9px] mb-0.5">CHAVE DE ACESSO SEFAZ</div>
                {formatAccessKey(invoice.accessKey)}
              </div>

              {/* Simulação Visual do QR Code SEFAZ */}
              <div className="flex flex-col items-center justify-center my-2 p-2 bg-slate-50 border border-gray-300 rounded">
                <QrCode className="w-20 h-20 text-black mb-1" />
                <div className="text-[8px] text-gray-600 text-center">
                  Consulte pela Chave de Acesso em www.fazenda.sp.gov.br/nfce
                </div>
              </div>

              <div className="text-[8px] text-gray-500 mt-2">
                Operador: {sale.operatorName} • Venda: {sale.code} • PDV Caixa #{sale.cashRegisterId}
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="p-3 bg-slate-800 border-t border-slate-700 flex flex-wrap gap-2 justify-end">
          <button
            onClick={handleDownloadXml}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-600"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Baixar XML Fiscal (4.00)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-900/30"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cupom Térmico (80mm)</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
