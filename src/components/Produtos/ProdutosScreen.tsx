import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Barcode,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Product, Category, Brand } from '../../types';
import { StorageService } from '../../services/storage';

export const ProdutosScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const categories = StorageService.getCategories();
  const brands = StorageService.getBrands();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'NORMAL'>('ALL');

  // Modal de Cadastro/Edição
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategoryId, setFormCategoryId] = useState(categories[0]?.id || '');
  const [formBrandId, setFormBrandId] = useState(brands[0]?.id || '');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSalePrice, setFormSalePrice] = useState<number>(0);
  const [formCurrentStock, setFormCurrentStock] = useState<number>(10);
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formUnit, setFormUnit] = useState('UN');
  const [formNcm, setFormNcm] = useState('2202.10.00');
  const [formCfop, setFormCfop] = useState('5.102');
  const [formCstCsosn, setFormCstCsosn] = useState('0102');
  const [formIcms, setFormIcms] = useState<number>(18.0);
  const [formPis, setFormPis] = useState<number>(1.65);
  const [formCofins, setFormCofins] = useState<number>(7.60);
  const [formDescription, setFormDescription] = useState('');

  const refreshProducts = () => {
    setProducts(StorageService.getProducts());
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku('SKU-' + Math.floor(1000 + Math.random() * 9000));
    setFormBarcode('789' + Math.floor(1000000000 + Math.random() * 9000000000));
    setFormCategoryId(categories[0]?.id || '');
    setFormBrandId(brands[0]?.id || '');
    setFormCostPrice(5.0);
    setFormSalePrice(10.0);
    setFormCurrentStock(20);
    setFormMinStock(5);
    setFormUnit('UN');
    setFormNcm('2202.10.00');
    setFormCfop('5.102');
    setFormCstCsosn('0102');
    setFormIcms(18.0);
    setFormPis(1.65);
    setFormCofins(7.60);
    setFormDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormBarcode(p.barcode);
    setFormCategoryId(p.categoryId);
    setFormBrandId(p.brandId || brands[0]?.id || '');
    setFormCostPrice(p.costPrice);
    setFormSalePrice(p.salePrice);
    setFormCurrentStock(p.currentStock);
    setFormMinStock(p.minStock);
    setFormUnit(p.unit);
    setFormNcm(p.ncm);
    setFormCfop(p.cfop);
    setFormCstCsosn(p.cstCsosn);
    setFormIcms(p.icmsAliquota);
    setFormPis(p.pisAliquota);
    setFormCofins(p.cofinsAliquota);
    setFormDescription(p.description || '');
    setShowModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const margin = formCostPrice > 0 ? ((formSalePrice - formCostPrice) / formCostPrice) * 100 : 0;
    const cat = categories.find(c => c.id === formCategoryId);
    const br = brands.find(b => b.id === formBrandId);

    const productData: Product = {
      id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
      name: formName,
      sku: formSku,
      barcode: formBarcode,
      categoryId: formCategoryId,
      categoryName: cat?.name || 'Geral',
      brandId: formBrandId,
      brandName: br?.name || 'Geral',
      costPrice: formCostPrice,
      salePrice: formSalePrice,
      marginPercent: parseFloat(margin.toFixed(2)),
      currentStock: formCurrentStock,
      minStock: formMinStock,
      unit: formUnit,
      active: true,
      ncm: formNcm,
      cfop: formCfop,
      cstCsosn: formCstCsosn,
      icmsAliquota: formIcms,
      pisAliquota: formPis,
      cofinsAliquota: formCofins,
      description: formDescription,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    StorageService.saveProduct(productData);
    refreshProducts();
    setShowModal(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Deseja realmente desativar ou excluir este produto?')) {
      StorageService.deleteProduct(productId);
      refreshProducts();
    }
  };

  // Exportar produtos em JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'produtos_nexus_erp.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || p.categoryId === categoryFilter;
    const isLow = p.currentStock <= p.minStock;
    const matchStock = stockFilter === 'ALL' || (stockFilter === 'LOW' ? isLow : !isLow);
    return matchSearch && matchCat && matchStock;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            <span>Gestão de Produtos & Catálogo de Vendas</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastro completo de mercadorias, tributação fiscal (NCM/CFOP/ICMS), margem de lucro e controle de estoque.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar JSON</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-900/40"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-3 shadow-lg">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por descrição, código de barras EAN ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">Status do Estoque (Todos)</option>
            <option value="LOW">Estoque Baixo / Ruptura</option>
            <option value="NORMAL">Estoque Regular</option>
          </select>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/80 text-slate-400 font-semibold">
                <th className="py-3 px-4">Produto & SKU</th>
                <th className="py-3 px-4">Código EAN</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-right">Custo</th>
                <th className="py-3 px-4 text-right">Venda</th>
                <th className="py-3 px-4 text-right">Margem</th>
                <th className="py-3 px-4 text-center">Estoque</th>
                <th className="py-3 px-4">Fiscal (NCM/CFOP)</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((p) => {
                const isLowStock = p.currentStock <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} • {p.unit}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <span className="flex items-center gap-1">
                        <Barcode className="w-3.5 h-3.5 text-slate-500" />
                        {p.barcode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                        {p.categoryName || 'Geral'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      R$ {p.costPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      R$ {p.salePrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-cyan-400">
                      {p.marginPercent.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          isLowStock
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {isLowStock && <AlertTriangle className="w-3 h-3" />}
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                      NCM: {p.ncm} • CFOP: {p.cfop}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition-colors"
                          title="Editar Produto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-white">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                <span>{editingProduct ? 'Editar Produto Cadastrado' : 'Novo Cadastro de Produto'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Nome / Descrição Comercial do Produto *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Arroz Branco Tipo 1 5kg"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Código de Barras (EAN-13) *</label>
                  <input
                    type="text"
                    required
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="789..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Código SKU / Referência Interna *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="ALM-001"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Categoria de Mercadoria:</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Marca / Fabricante:</label>
                  <select
                    value={formBrandId}
                    onChange={(e) => setFormBrandId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seção Financeira e Estoque */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-emerald-500 rounded-lg p-2 text-xs text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Estoque Atual</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formCurrentStock}
                    onChange={(e) => setFormCurrentStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Seção Tributária Fiscal Brasileira */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Regras Tributárias & Fiscais (SEFAZ)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">NCM:</label>
                    <input
                      type="text"
                      required
                      value={formNcm}
                      onChange={(e) => setFormNcm(e.target.value)}
                      placeholder="2202.10.00"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">CFOP:</label>
                    <input
                      type="text"
                      required
                      value={formCfop}
                      onChange={(e) => setFormCfop(e.target.value)}
                      placeholder="5.102"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">CST / CSOSN:</label>
                    <input
                      type="text"
                      required
                      value={formCstCsosn}
                      onChange={(e) => setFormCstCsosn(e.target.value)}
                      placeholder="0102"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-900/40"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
