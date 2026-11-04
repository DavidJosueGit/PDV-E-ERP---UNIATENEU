/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { PdvScreen } from './components/PDV/PdvScreen';
import { ProdutosScreen } from './components/Produtos/ProdutosScreen';
import { EstoqueScreen } from './components/Estoque/EstoqueScreen';
import { CaixaScreen } from './components/Caixa/CaixaScreen';
import { CaixaModal, SangriaSuprimentoModal } from './components/Caixa/CaixaModal';
import { TefScreen } from './components/TEF/TefScreen';
import { FiscalScreen } from './components/Fiscal/FiscalScreen';
import { ClientesScreen } from './components/Clientes/ClientesScreen';
import { FinanceiroScreen } from './components/Financeiro/FinanceiroScreen';
import { DashboardScreen } from './components/Dashboard/DashboardScreen';
import { UsuariosScreen } from './components/Usuarios/UsuariosScreen';
import { JavaSwaggerScreen } from './components/JavaSwagger/JavaSwaggerScreen';
import { StorageService } from './services/storage';
import { User, CashRegister } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(StorageService.getCurrentUser());
  const [activeCashRegister, setActiveCashRegister] = useState<CashRegister | null>(
    StorageService.getActiveCashRegister()
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('pdv');
  const [showCaixaModal, setShowCaixaModal] = useState<boolean>(false);
  const [showSangriaModal, setShowSangriaModal] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefresh = () => {
    setCurrentUser(StorageService.getCurrentUser());
    setActiveCashRegister(StorageService.getActiveCashRegister());
    setRefreshKey((prev) => prev + 1);
  };

  const handleUserChange = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  return (
    <div key={refreshKey} className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onUserChange={handleUserChange}
        cashRegister={activeCashRegister}
        onOpenCashModal={() => setShowCaixaModal(true)}
        onRefresh={handleRefresh}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={currentUser.role}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'pdv' && (
            <PdvScreen
              cashRegister={activeCashRegister}
              onOpenCashModal={() => setShowCaixaModal(true)}
              onOpenSangriaModal={() => setShowSangriaModal(true)}
            />
          )}

          {activeTab === 'produtos' && <ProdutosScreen />}

          {activeTab === 'estoque' && <EstoqueScreen />}

          {activeTab === 'caixa' && (
            <CaixaScreen
              onOpenCaixaModal={() => setShowCaixaModal(true)}
              onOpenSangriaModal={() => setShowSangriaModal(true)}
            />
          )}

          {activeTab === 'tef' && <TefScreen />}

          {activeTab === 'fiscal' && <FiscalScreen />}

          {activeTab === 'clientes' && <ClientesScreen />}

          {activeTab === 'financeiro' && <FinanceiroScreen />}

          {activeTab === 'relatorios' && <DashboardScreen />}

          {activeTab === 'usuarios' && <UsuariosScreen />}

          {activeTab === 'java_swagger' && <JavaSwaggerScreen />}
        </main>
      </div>

      {/* Global Modals */}
      {showCaixaModal && (
        <CaixaModal
          cashRegister={activeCashRegister}
          onClose={() => setShowCaixaModal(false)}
          onUpdated={handleRefresh}
        />
      )}

      {showSangriaModal && activeCashRegister && (
        <SangriaSuprimentoModal
          cashRegister={activeCashRegister}
          onClose={() => setShowSangriaModal(false)}
          onUpdated={handleRefresh}
        />
      )}
    </div>
  );
}
