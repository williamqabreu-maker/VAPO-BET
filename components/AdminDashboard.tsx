

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserPlan, UserStatus, Transaction } from '../types';
import { dbService } from '../services/database';
import { 
    Users, DollarSign, Activity, Search, Trash2, Shield, 
    MoreVertical, Download, RefreshCw, Crown, AlertTriangle, 
    CheckCircle2, XCircle, Database, LayoutDashboard, CreditCard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState(dbService.getStats());
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'finance'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load Data
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
        setUsers(dbService.getUsers());
        setTransactions(dbService.getTransactions());
        setStats(dbService.getStats());
        setIsRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Actions
  const handleUpdatePlan = (userId: string, plan: UserPlan) => {
    dbService.updateUserPlan(userId, plan);
    refreshData();
  };

  const handleToggleStatus = (user: User) => {
      const newStatus = user.status === 'banned' ? 'active' : 'banned';
      dbService.updateUserPlan(user.id, user.plan, newStatus);
      refreshData();
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza? Essa ação é irreversível.')) {
        dbService.deleteUser(userId);
        refreshData();
    }
  };

  const handleGenerateData = () => {
      dbService.seedDatabase();
      refreshData();
      alert("Dados de demonstração gerados com sucesso!");
  };

  // Filter Logic
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock Chart Data for Overview
  const revenueData = [
      { name: 'Jan', value: 2400 }, { name: 'Fev', value: 1398 },
      { name: 'Mar', value: 9800 }, { name: 'Abr', value: 3908 },
      { name: 'Mai', value: 4800 }, { name: 'Jun', value: stats.totalRevenue }
  ];

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* Header Panel */}
      <div className="bg-slate-900 border-b border-slate-800 pb-6 mb-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                 <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                     <Shield className="text-indigo-500" /> VapoBet <span className="text-slate-500">Admin</span>
                 </h2>
                 <p className="text-slate-400 text-sm">Controle total da sua operação SaaS.</p>
             </div>
             <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                 {['overview', 'users', 'finance'].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                     >
                        {tab === 'overview' ? 'Visão Geral' : tab === 'users' ? 'Usuários' : 'Financeiro'}
                     </button>
                 ))}
             </div>
         </div>
      </div>

      {/* --- TAB: OVERVIEW --- */}
      {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Users size={20} /></div>
                          <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">+12%</span>
                      </div>
                      <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Usuários</p>
                      <h3 className="text-3xl font-mono font-bold text-white">{stats.totalUsers}</h3>
                  </div>
                  
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-emerald-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><DollarSign size={20} /></div>
                          <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">+8.2%</span>
                      </div>
                      <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">MRR (Mensal)</p>
                      <h3 className="text-3xl font-mono font-bold text-white">{formatCurrency(stats.totalRevenue)}</h3>
                  </div>

                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-yellow-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Crown size={20} /></div>
                          <span className="text-xs font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded">PRO</span>
                      </div>
                      <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Assinantes PRO</p>
                      <h3 className="text-3xl font-mono font-bold text-white">{stats.proCount}</h3>
                  </div>

                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-rose-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><Activity size={20} /></div>
                          <span className="text-xs font-bold bg-rose-500/10 text-rose-400 px-2 py-1 rounded">-0.4%</span>
                      </div>
                      <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Churn Rate</p>
                      <h3 className="text-3xl font-mono font-bold text-white">{stats.churnRate}%</h3>
                  </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
                      <h3 className="text-lg font-bold text-white mb-6">Crescimento de Receita</h3>
                      <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={revenueData}>
                                  <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ color: '#818cf8' }} />
                                  <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700 flex flex-col justify-center items-center text-center">
                      <Database size={48} className="text-indigo-500 mb-4 opacity-50" />
                      <h3 className="text-xl font-bold text-white mb-2">Banco de Dados (Simulado)</h3>
                      <p className="text-slate-400 text-sm mb-6 max-w-xs">
                          O sistema está rodando localmente. Gere dados de teste para popular as tabelas e visualizar métricas.
                      </p>
                      <button 
                        onClick={handleGenerateData}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2"
                      >
                          <RefreshCw size={18} /> Gerar Massa de Dados
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- TAB: USERS --- */}
      {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar usuário por nome, email..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none"
                      />
                  </div>
                  <div className="flex gap-2">
                       <button onClick={refreshData} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors border border-slate-700">
                           <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                       </button>
                       <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                           <Download size={16} /> Exportar CSV
                       </button>
                  </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead>
                          <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 uppercase font-bold text-xs tracking-wider">
                              <th className="p-4">Usuário</th>
                              <th className="p-4">Plano</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Entrou em</th>
                              <th className="p-4 text-right">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                          {filteredUsers.map((u) => (
                              <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                                  <td className="p-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                                              {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : <span className="font-bold text-slate-500">{u.name.charAt(0)}</span>}
                                          </div>
                                          <div>
                                              <p className="font-bold text-white">{u.name}</p>
                                              <p className="text-slate-500 text-xs">{u.email}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="p-4">
                                      <div className="flex gap-1">
                                          {['free', 'pro'].map((plan) => (
                                              <button
                                                key={plan}
                                                onClick={() => handleUpdatePlan(u.id, plan as UserPlan)}
                                                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border transition-all ${
                                                    u.plan === plan 
                                                    ? plan === 'pro' ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-slate-600 text-white border-slate-500'
                                                    : 'bg-transparent text-slate-600 border-slate-800 hover:border-slate-600'
                                                }`}
                                              >
                                                  {plan}
                                              </button>
                                          ))}
                                      </div>
                                  </td>
                                  <td className="p-4">
                                      <button onClick={() => handleToggleStatus(u)} className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                          {u.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                          <span className="uppercase">{u.status}</span>
                                      </button>
                                  </td>
                                  <td className="p-4 text-slate-400 font-mono text-xs">
                                      {new Date(u.joinedAt).toLocaleDateString()}
                                  </td>
                                  <td className="p-4 text-right">
                                      {u.role !== 'admin' && (
                                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded transition-colors" title="Excluir"><Trash2 size={16} /></button>
                                          </div>
                                      )}
                                      {u.role === 'admin' && <span className="text-xs text-indigo-400 font-bold px-2">ADMIN</span>}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  </div>
                  {filteredUsers.length === 0 && <div className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</div>}
              </div>
          </div>
      )}

      {/* --- TAB: FINANCE (Real Transactions) --- */}
      {activeTab === 'finance' && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                 <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <DollarSign size={20} className="text-emerald-400" /> Histórico de Transações
                    </h3>
                    <div className="text-xs text-slate-500">
                        {transactions.length} registros
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 uppercase font-bold text-xs tracking-wider">
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Plano</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Método</th>
                                <th className="p-4 text-right">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {transactions.map(t => (
                                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 font-bold text-white">{t.userName}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${t.planPurchased === 'pro' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-slate-600/10 text-slate-400 border-slate-500/30'}`}>
                                            {t.planPurchased}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-emerald-400 font-bold">R$ {t.amount.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1 text-xs font-bold ${t.status === 'approved' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {t.status === 'approved' ? <CheckCircle2 size={12} /> : <Activity size={12} />}
                                            {t.status === 'approved' ? 'Aprovado' : t.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-xs uppercase flex items-center gap-1">
                                        {t.method === 'pix' ? <Database size={12} /> : <CreditCard size={12} />}
                                        {t.method}
                                    </td>
                                    <td className="p-4 text-right text-slate-500 text-xs font-mono">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                 </div>
                 {transactions.length === 0 && (
                     <div className="p-12 text-center text-slate-500">Nenhuma transação registrada.</div>
                 )}
              </div>
          </div>
      )}

    </div>
  );
};