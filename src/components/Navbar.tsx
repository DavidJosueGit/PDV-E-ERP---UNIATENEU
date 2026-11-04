import React, { useState, useEffect } from 'react';
import {
  Store,
  UserCheck,
  ShieldAlert,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ChevronDown
} from 'lucide-react';
import { User, CashRegister, UserRole } from '../types';
import { StorageService } from '../services/storage';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  cashRegister: CashRegister | null;
  onOpenCashModal: () => void;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  cashRegister,
  onOpenCashModal,
  onRefresh,
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('pt-BR'));
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const users = StorageService.getUsers();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResetData = () => {
    if (confirm('Deseja restaurar a base de demonstração para os dados originais?')) {
      StorageService.resetDatabase();
      onRefresh();
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded font-medium border border-red-500/30">ADMINISTRADOR</span>;
      case 'GERENTE':
        return <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded font-medium border border-purple-500/30">GERENTE</span>;
      case 'OPERADOR_CAIXA':
        return <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded font-medium border border-blue-500/30">OPERADOR DE CAIXA</span>;
      case 'ESTOQUISTA':
        return <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded font-medium border border-amber-500/30">ESTOQUISTA</span>;
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 flex items-center justify-between shadow-md select-none sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-600 p-2 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/30">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black tracking-wider text-base uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Nexus PDV & ERP
            </span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-mono border border-slate-700">
              JAVA SPRING BOOT 3
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Matriz: Nexus Comércio Varejista Ltda • CNPJ 12.345.678/0001-90</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Caixa Status */}
        <button
          onClick={onOpenCashModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            cashRegister && cashRegister.status === 'ABERTO'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
          }`}
          title="Clique para gerenciar o caixa"
        >
          {cashRegister && cashRegister.status === 'ABERTO' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>CAIXA #{cashRegister.terminalNumber} ABERTO (R$ {cashRegister.currentBalance.toFixed(2)})</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>CAIXA FECHADO - CLIQUE PARA ABRIR</span>
            </>
          )}
        </button>

        {/* Relógio em tempo real */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{time}</span>
        </div>

        {/* Alternador de Perfil / Usuário */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-slate-200">{currentUser.name.split(' ')[0]}</div>
              <div>{getRoleBadge(currentUser.role)}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Alternar Usuário (RBAC)</p>
                <p className="text-xs text-slate-300">Simule permissões de cada perfil:</p>
              </div>
              <div className="p-1 space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onUserChange(u);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex flex-col gap-1 transition-colors ${
                      currentUser.id === u.id ? 'bg-slate-800 text-emerald-400 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{u.name}</span>
                      {getRoleBadge(u.role)}
                    </div>
                    <span className="text-[10px] text-slate-500">{u.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Restaurar dados */}
        <button
          onClick={handleResetData}
          title="Restaurar dados iniciais"
          className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
