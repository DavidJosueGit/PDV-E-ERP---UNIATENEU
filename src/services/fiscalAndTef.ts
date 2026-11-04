import { Sale, Invoice, PaymentMethod } from '../types';

export interface TefTransactionResult {
  success: boolean;
  nsu: string;
  authorizationCode: string;
  acquirer: string;
  cardBrand: string;
  cardLastDigits: string;
  installments: number;
  message: string;
}

export class TefPaymentService {
  static async processCardPayment(
    method: 'CARTAO_CREDITO' | 'CARTAO_DEBITO',
    amount: number,
    installments = 1,
    acquirer = 'STONE_TEF'
  ): Promise<TefTransactionResult> {
    // Simula comunicação de rede com o terminal PINPAD / POS TEF
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const nsu = Math.floor(100000 + Math.random() * 900000).toString();
    const authCode = Math.floor(100000 + Math.random() * 900000).toString();
    const brands = ['VISA', 'MASTERCARD', 'ELO', 'HIPERCARD'];
    const selectedBrand = brands[Math.floor(Math.random() * brands.length)];
    const lastDigits = Math.floor(1000 + Math.random() * 9000).toString();

    return {
      success: true,
      nsu,
      authorizationCode: authCode,
      acquirer: acquirer === 'STONE_TEF' ? 'Stone Pagamentos' : acquirer === 'CIELO' ? 'Cielo Brasil' : 'Mercado Pago Point',
      cardBrand: selectedBrand,
      cardLastDigits: lastDigits,
      installments,
      message: `Transação Aprovada via ${selectedBrand} final ${lastDigits}`,
    };
  }
}

export class FiscalService {
  static generateNfceXml(sale: Sale, invoice: Invoice): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${invoice.accessKey}" versao="4.00">
    <ide>
      <cUF>35</cUF>
      <cNF>${invoice.accessKey.slice(35, 43)}</cNF>
      <natOp>VENDA MERCADORIA VAREJO</natOp>
      <mod>65</mod>
      <serie>${invoice.series}</serie>
      <nNF>${parseInt(invoice.invoiceNumber, 10)}</nNF>
      <dhEmi>${invoice.emissionDate}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>3550308</cMunFG>
      <tpImp>4</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>${invoice.accessKey.slice(43, 44)}</cDV>
      <tpAmb>2</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>NexusERP-v2.5</verProc>
    </ide>
    <emit>
      <CNPJ>12345678000190</CNPJ>
      <xNome>NEXUS SUPERMERCADO E COMERCIO LTDA</xNome>
      <xFant>NEXUS COMERCIAL</xFant>
      <enderEmit>
        <xLgr>AVENIDA BRASIL</xLgr>
        <nro>1500</nro>
        <xBairro>CENTRO</xBairro>
        <cMun>3550308</cMun>
        <xMun>SAO PAULO</xMun>
        <UF>SP</UF>
        <CEP>01310100</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
      </enderEmit>
      <IE>112233445566</IE>
      <CRT>1</CRT>
    </emit>
    <dest>
      ${sale.customerCpfCnpj ? `<CPF>${sale.customerCpfCnpj.replace(/\D/g, '')}</CPF>` : ''}
      <xNome>${sale.customerName || 'CONSUMIDOR FINAL'}</xNome>
      <indIEDest>9</indIEDest>
    </dest>
    ${sale.items
      .map(
        (item, index) => `
    <det nItem="${index + 1}">
      <prod>
        <cProd>${item.sku}</cProd>
        <cEAN>${item.barcode}</cEAN>
        <xProd>${item.productName.toUpperCase()}</xProd>
        <NCM>22021000</NCM>
        <CFOP>5102</CFOP>
        <uCom>UN</uCom>
        <qCom>${item.quantity.toFixed(4)}</qCom>
        <vUnCom>${item.unitPrice.toFixed(2)}</vUnCom>
        <vProd>${(item.quantity * item.unitPrice).toFixed(2)}</vProd>
        <cEANTrib>${item.barcode}</cEANTrib>
        <uTrib>UN</uTrib>
        <qTrib>${item.quantity.toFixed(4)}</qTrib>
        <vUnTrib>${item.unitPrice.toFixed(2)}</vUnTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <ICMS>
          <ICMSSN102>
            <orig>0</orig>
            <CSOSN>102</CSOSN>
          </ICMSSN102>
        </ICMS>
        <PIS>
          <PISAliq>
            <CST>01</CST>
            <vBC>${item.total.toFixed(2)}</vBC>
            <pPIS>1.65</pPIS>
            <vPIS>${((item.total * 1.65) / 100).toFixed(2)}</vPIS>
          </PISAliq>
        </PIS>
        <COFINS>
          <COFINSAliq>
            <CST>01</CST>
            <vBC>${item.total.toFixed(2)}</vBC>
            <pCOFINS>7.60</pCOFINS>
            <vCOFINS>${((item.total * 7.60) / 100).toFixed(2)}</vCOFINS>
          </COFINSAliq>
        </COFINS>
      </imposto>
    </det>`
      )
      .join('')}
    <total>
      <ICMSTot>
        <vBC>0.00</vBC>
        <vICMS>0.00</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>${sale.subtotal.toFixed(2)}</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>${sale.discountTotal.toFixed(2)}</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>0.00</vPIS>
        <vCOFINS>0.00</vCOFINS>
        <vOutro>${sale.additionTotal.toFixed(2)}</vOutro>
        <vNF>${sale.total.toFixed(2)}</vNF>
      </ICMSTot>
    </total>
    <pag>
      ${sale.payments
        .map(
          (p) => `
      <detPag>
        <tPag>${this.mapPaymentMethodToSefaz(p.method)}</tPag>
        <vPag>${p.amount.toFixed(2)}</vPag>
        ${
          p.method === 'CARTAO_CREDITO' || p.method === 'CARTAO_DEBITO'
            ? `
        <card>
          <tpIntegra>1</tpIntegra>
          <CNPJ>00000000000191</CNPJ>
          <tBand>01</tBand>
          <cAut>${p.tefAuthCode || '123456'}</cAut>
        </card>`
            : ''
        }
      </detPag>`
        )
        .join('')}
    </pag>
    <infAdic>
      <infCpl>DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. TRIBUTOS TOTAIS APROX (LEI 12.741/2012): R$ ${(
        sale.total * 0.2845
      ).toFixed(2)} (28.45%). Operador: ${sale.operatorName}. Caixa: ${sale.cashRegisterId}.</infCpl>
    </infAdic>
    <infRespTec>
      <CNPJ>12345678000190</CNPJ>
      <xContato>Nexus Solucoes em Software Ltda</xContato>
      <email>fiscal@nexuserp.com.br</email>
      <fone>1134567890</fone>
    </infRespTec>
  </infNFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>2</tpAmb>
      <verAplic>SP_NFE_PL_009_V400</verAplic>
      <chNFe>${invoice.accessKey}</chNFe>
      <dhRecbto>${invoice.emissionDate}</dhRecbto>
      <nProt>${invoice.protocol}</nProt>
      <digVal>${invoice.digestValue}</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</NFe>`;
    return xml.trim();
  }

  static mapPaymentMethodToSefaz(method: PaymentMethod): string {
    switch (method) {
      case 'DINHEIRO':
        return '01';
      case 'CARTAO_CREDITO':
        return '03';
      case 'CARTAO_DEBITO':
        return '04';
      case 'CREDIARIO':
        return '05';
      case 'PIX':
        return '17';
      default:
        return '99';
    }
  }

  static downloadXml(sale: Sale, invoice: Invoice): void {
    const xmlContent = this.generateNfceXml(sale, invoice);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NFe-${invoice.accessKey}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
