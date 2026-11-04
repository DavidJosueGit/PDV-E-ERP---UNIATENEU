import React from 'react';
import {
  ShoppingCart,
  Package,
  Layers,
  Banknote,
  CreditCard,
  FileText,
  Users,
  PieChart,
  BarChart3,
  ShieldCheck,
  Code2,
  Cpu
} from 'lucide-react';
import { UserRole } from '../types';

export type ActiveTab =
  | 'pdv'
  | 'produtos'
  | 'estoque'
  | 'caixa'
  | 'tef'
  | 'fiscal'
  | 'clientes'
  | 'financeiro'
  | 'relatorios'
  | 'usuarios'
  | 'java_swagger';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, userRole }) => {
  const menuItems = [
    {
      id: 'pdv' as ActiveTab,
      label: 'Frente de Caixa (PDV)',
      icon: ShoppingCart,
      color: 'text-emerald-400',
      allowedRoles: ['ADMIN', 'GERENTE', 'OPERADOR_CAIXA', 'ESTOQUISTA'],
      shortcut: 'F2',
    },
    {
      id: 'produtos' as ActiveTab,
      label: 'Produtos & Catálogo',
      icon: Package,
      color: 'text-blue-400',
      allowedRoles: ['ADMIN', 'GERENTE', 'ESTOQUISTA'],
    },
    {
      id: 'estoque' as ActiveTab,
      label: 'Controle de Estoque',
      icon: Layers,
      color: 'text-amber-400',
      allowedRoles: ['ADMIN', 'GERENTE', 'ESTOQUISTA'],
    },
    {
      id: 'caixa' as ActiveTab,
      label: 'Caixa & Turnos',
      icon: Banknote,
      color: 'text-teal-400',
      allowedRoles: ['ADMIN', 'GERENTE', 'OPERADOR_CAIXA'],
    },
    {
      id: 'tef' as ActiveTab,
      label: 'TEF & Cartões',
      icon: CreditCard,
      color: 'text-indigo-400',
      allowedRoles: ['ADMIN', 'GERENTE', 'OPERADOR_CAIXA'],
    },
    {
      id: 'fiscal' as ActiveTab,
      label: 'Documentos Fiscais',
      icon: FileText,
      color: 'text-rose-400',
      allowedRoles: ['ADMIN', 'GERENTE', 'OPERADOR_CAIXA'],
    },
    {
      id: 'clientes' as ActiveTab,
      label: 'Clientes & Fornecedores',
      icon: Users,
      color: 'text-cyan-400',
      allowedRoles: ['ADMIN', 'GERENTE'],
    },
    {
      id: 'financeiro' as ActiveTab,
      label: 'Financeiro & DRE',
      icon: PieChart,
      color: 'text-yellow-400',
      allowedRoles: ['ADMIN', 'GERENTE'],
    },
    {
      id: 'relatorios' as ActiveTab,
      label: 'Relatórios & Gráficos',
      icon: BarChart3,
      color: 'text-emerald-400',
      allowedRoles: ['ADMIN', 'GERENTE'],
    },
    {
      id: 'usuarios' as ActiveTab,
      label: 'Segurança & Auditoria',
      icon: ShieldCheck,
      color: 'text-purple-400',
      allowedRoles: ['ADMIN'],
    },
    {
      id: 'java_swagger' as ActiveTab,
      label: 'Backend Java & Swagger',
      icon: Code2,
      color: 'text-orange-400',
      badge: 'SPRING 3',
      allowedRoles: ['ADMIN', 'GERENTE', 'OPERADOR_CAIXA', 'ESTOQUISTA'],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      <div className="p-3 border-b border-slate-800/80">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 py-1">
          Módulos Integrados
        </div>
      </div>
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isAllowed = item.allowedRoles.includes(userRole);
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              disabled={!isAllowed}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : isAllowed
                  ? 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.color}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.shortcut && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                    {item.shortcut}
                  </span>
                )}
                {item.badge && (
                  <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono font-bold border border-orange-500/30">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>PostgreSQL 16 • Flyway V1.0</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          SEFAZ SP v4.00 • Homologação Ativa
        </div>
      </div>
    </aside>
  );
};
