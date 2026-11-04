import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  History,
  Key,
  Lock,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { User, AuditLog, UserRole } from '../../types';

export const UsuariosScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(StorageService.getAuditLogs());
  const [activeTab, setActiveTab] = useState<'USUARIOS' | 'AUDITORIA' | 'PERMISSOES'>('USUARIOS');

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <span>Segurança, Controle de Acesso (RBAC) & Auditoria</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de perfis de operadores, controle de sessões JWT e log imutável de atividades no sistema.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('USUARIOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'USUARIOS'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Operadores ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('PERMISSOES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'PERMISSOES'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Matriz de Permissões
          </button>
          <button
            onClick={() => setActiveTab('AUDITORIA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'AUDITORIA'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Logs de Auditoria ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Conteúdo Aba Usuários */}
      {activeTab === 'USUARIOS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-purple-400">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{u.name}</h3>
                    <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    u.role === 'ADMIN'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : u.role === 'GERENTE'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : u.role === 'OPERADOR_CAIXA'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {u.role}
                </span>
              </div>

              <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between">
                <span>Status da Conta: <strong className="text-emerald-400">ATIVO</strong></span>
                <span>Criptografia: <strong className="font-mono text-slate-300">BCrypt (12 rounds)</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo Aba Matriz de Permissões */}
      {activeTab === 'PERMISSOES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Matriz de Autorização por Perfil de Usuário</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Módulo / Funcionalidade</th>
                  <th className="py-3 px-4 text-center">ADMIN</th>
                  <th className="py-3 px-4 text-center">GERENTE</th>
                  <th className="py-3 px-4 text-center">OPERADOR_CAIXA</th>
                  <th className="py-3 px-4 text-center">ESTOQUISTA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { module: 'PDV - Realizar Vendas', admin: true, gerente: true, caixa: true, estoque: false },
                  { module: 'PDV - Cancelar Venda / Itens', admin: true, gerente: true, caixa: false, estoque: false },
                  { module: 'Caixa - Abertura e Fechamento', admin: true, gerente: true, caixa: true, estoque: false },
                  { module: 'Caixa - Sangria e Suprimento', admin: true, gerente: true, caixa: true, estoque: false },
                  { module: 'Produtos - Cadastrar e Editar', admin: true, gerente: true, caixa: false, estoque: true },
                  { module: 'Estoque - Movimentação Manual', admin: true, gerente: true, caixa: false, estoque: true },
                  { module: 'Fiscal - Emissão e Cancelamento', admin: true, gerente: true, caixa: true, estoque: false },
                  { module: 'Financeiro - Contas a Pagar/Receber', admin: true, gerente: true, caixa: false, estoque: false },
                  { module: 'Relatórios - Dashboard e DRE', admin: true, gerente: true, caixa: false, estoque: false },
                  { module: 'Segurança - Usuários e Auditoria', admin: true, gerente: false, caixa: false, estoque: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 font-semibold text-white">{row.module}</td>
                    <td className="py-3 px-4 text-center">
                      {row.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.gerente ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.caixa ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.estoque ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo Aba Auditoria */}
      {activeTab === 'AUDITORIA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Trilha de Auditoria do Sistema (Audit Logs)</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Data/Hora</th>
                  <th className="py-3 px-4">Operador</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Ação</th>
                  <th className="py-3 px-4">Detalhes da Operação</th>
                  <th className="py-3 px-4 text-right">Origem (IP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{log.userName}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px] text-slate-300 border border-slate-700">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-300">{log.action}</td>
                    <td className="py-3 px-4 text-slate-300">{log.details}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 text-[10px]">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
