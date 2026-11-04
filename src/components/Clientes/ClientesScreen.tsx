import React, { useState } from 'react';
import {
  Users,
  Building2,
  Plus,
  Search,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  X,
  CheckCircle2
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Customer, Supplier } from '../../types';

export const ClientesScreen: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(StorageService.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(StorageService.getSuppliers());
  const [activeTab, setActiveTab] = useState<'CLIENTES' | 'FORNECEDORES'>('CLIENTES');
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Form Cliente
  const [custName, setCustName] = useState('');
  const [custCpf, setCustCpf] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custCity, setCustCity] = useState('São Paulo');
  const [custState, setCustState] = useState('SP');
  const [custCreditLimit, setCustCreditLimit] = useState<number>(2000);

  // Form Fornecedor
  const [supCorpName, setSupCorpName] = useState('');
  const [supTradeName, setSupTradeName] = useState('');
  const [supCnpj, setSupCnpj] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supCategory, setSupCategory] = useState('Distribuição de Alimentos');

  const refreshData = () => {
    setCustomers(StorageService.getCustomers());
    setSuppliers(StorageService.getSuppliers());
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      id: 'cust-' + Date.now(),
      name: custName,
      cpfCnpj: custCpf,
      email: custEmail,
      phone: custPhone,
      address: custAddress,
      city: custCity,
      state: custState,
      creditLimit: custCreditLimit,
      creditUsed: 0,
      totalPurchases: 0,
      createdAt: new Date().toISOString(),
    };
    StorageService.saveCustomer(newCustomer);
    refreshData();
    setShowCustomerModal(false);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newSupplier: Supplier = {
      id: 'sup-' + Date.now(),
      corporateName: supCorpName,
      tradeName: supTradeName,
      cnpj: supCnpj,
      email: supEmail,
      phone: supPhone,
      contactPerson: supContact,
      category: supCategory,
      createdAt: new Date().toISOString(),
    };
    StorageService.saveSupplier(newSupplier);
    refreshData();
    setShowSupplierModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Gestão de Parceiros Comerciais</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastro de clientes com limite de crediário e fornecedores de mercadorias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('CLIENTES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'CLIENTES'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Clientes ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('FORNECEDORES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'FORNECEDORES'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fornecedores ({suppliers.length})
            </button>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'CLIENTES') setShowCustomerModal(true);
              else setShowSupplierModal(true);
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-900/40"
          >
            <Plus className="w-4 h-4" />
            <span>Novo {activeTab === 'CLIENTES' ? 'Cliente' : 'Fornecedor'}</span>
          </button>
        </div>
      </div>

      {/* Lista de Clientes */}
      {activeTab === 'CLIENTES' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{c.name}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">CPF/CNPJ: {c.cpfCnpj}</div>
                </div>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-cyan-500/30">
                  CLIENTE ATIVO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Limite de Crédito:</span>
                  <span className="font-mono font-bold text-emerald-400">R$ {c.creditLimit.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Crédito Utilizado:</span>
                  <span className="font-mono font-bold text-rose-400">R$ {c.creditUsed.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.address} • {c.city}/{c.state}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Lista de Fornecedores */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{s.tradeName}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{s.corporateName}</div>
                </div>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-indigo-500/30">
                  {s.category}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                CNPJ: {s.cnpj} • Contato: <strong className="text-slate-200">{s.contactPerson}</strong>
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{s.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{s.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="font-bold text-white text-sm">Cadastro de Novo Cliente</h2>
              <button onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome Completo / Razão Social *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">CPF ou CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={custCpf}
                    onChange={(e) => setCustCpf(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Limite de Crediário (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={custCreditLimit}
                    onChange={(e) => setCustCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Endereço Residencial / Comercial</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg"
                >
                  Cadastrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Fornecedor */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="font-bold text-white text-sm">Cadastro de Fornecedor</h2>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  value={supTradeName}
                  onChange={(e) => setSupTradeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Razão Social *</label>
                <input
                  type="text"
                  required
                  value={supCorpName}
                  onChange={(e) => setSupCorpName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={supCnpj}
                    onChange={(e) => setSupCnpj(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Categoria de Fornecimento</label>
                  <input
                    type="text"
                    value={supCategory}
                    onChange={(e) => setSupCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg"
                >
                  Cadastrar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
