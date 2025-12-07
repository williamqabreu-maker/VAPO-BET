
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { Trash2, Shield, User as UserIcon, Calendar, Search, ShieldAlert } from 'lucide-react';

export const AdminUserList: React.FC = () => {
  const { getAllUsers, deleteUser, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Wrap async call
    const fetchUsers = async () => {
        const data = await getAllUsers();
        setUsers(data);
    };
    fetchUsers();
  }, [getAllUsers]);

  const handleDelete = async (id: string) => {
    if (confirm('ATENÇÃO: Isso excluirá permanentemente o usuário e todos os dados dele. Continuar?')) {
      await deleteUser(id);
      const data = await getAllUsers();
      setUsers(data);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
       <div className="bg-gradient-to-r from-slate-900 to-indigo-900/40 border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
                    <ShieldAlert size={14} /> Área Restrita
                </div>
                <h2 className="text-3xl font-display font-bold text-white mb-2">Painel Administrativo</h2>
                <p className="text-slate-400 max-w-xl">
                    Gerenciamento total de usuários do SaaS. Você pode visualizar cadastros e remover contas que violam as regras.
                </p>
            </div>
       </div>

       <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <Search className="text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-white w-full placeholder:text-slate-600"
          />
       </div>

       <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-slate-950 text-xs text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-4 border-b border-slate-800">Usuário</th>
                    <th className="p-4 border-b border-slate-800">Role</th>
                    <th className="p-4 border-b border-slate-800">Membro Desde</th>
                    <th className="p-4 border-b border-slate-800 text-right">Ações</th>
                </tr>
             </thead>
             <tbody>
                {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 last:border-0">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                                    {u.avatarUrl ? (
                                        <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={18} className="text-slate-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{u.name}</p>
                                    <p className="text-slate-500 text-xs">{u.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                u.role === 'admin' 
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                                : 'bg-slate-700/30 text-slate-400 border-slate-600/30'
                            }`}>
                                {u.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                                {u.role}
                            </span>
                        </td>
                        <td className="p-4 text-slate-400 text-sm font-mono">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-slate-600" />
                                {new Date(u.joinedAt).toLocaleDateString('pt-BR')}
                            </div>
                        </td>
                        <td className="p-4 text-right">
                            {u.id !== currentUser?.id ? (
                                <button 
                                    onClick={() => handleDelete(u.id)}
                                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                    title="Excluir Usuário"
                                >
                                    <Trash2 size={16} />
                                </button>
                            ) : (
                                <span className="text-[10px] text-slate-600 italic px-2">Você</span>
                            )}
                        </td>
                    </tr>
                ))}
             </tbody>
          </table>
          {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                  Nenhum usuário encontrado.
              </div>
          )}
       </div>
    </div>
  );
};
