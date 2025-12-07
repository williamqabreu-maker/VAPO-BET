
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Shield, ArrowLeft, CheckCircle2, Database } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const switchToAdmin = () => {
      setMode('admin');
      setIsLogin(true);
      setFormData({ name: '', email: 'admin@vapobet.com', password: '' });
      setError(null);
  };

  const switchToUser = () => {
      setMode('user');
      setFormData({ name: '', email: '', password: '' });
      setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegistrationSuccess(false);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name) throw new Error("Nome é obrigatório.");
        await register(formData.name, formData.email, formData.password);
        setRegistrationSuccess(true);
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message;
      if (msg.includes("Invalid login credentials")) msg = "E-mail ou senha incorretos.";
      if (msg.includes("User already registered")) msg = "Este e-mail já está cadastrado.";
      if (msg.includes("Password should be")) msg = "A senha deve ter pelo menos 6 caracteres.";
      
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para criar usuário rapidamente e testar a conexão
  const handleCreateTestUser = async () => {
      if(isLoading) return;
      setIsLoading(true);
      setError(null);
      try {
          await register("Usuário Teste", "teste@vapobet.com", "123456");
          setRegistrationSuccess(true);
          setFormData({ name: '', email: 'teste@vapobet.com', password: '123456' });
          setIsLogin(true);
          alert("Usuário de Teste criado no Supabase! Clique em Entrar.");
      } catch (err: any) {
          if (err.message.includes("registered") || err.message.includes("cadastrado")) {
              setError("Usuário de teste já existe. Tente logar com teste@vapobet.com / 123456");
              setFormData({ name: '', email: 'teste@vapobet.com', password: '' });
              setIsLogin(true);
          } else {
              setError(`Erro Supabase: ${err.message}`);
          }
      } finally {
          setIsLoading(false);
      }
  };

  const isAdmin = mode === 'admin';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${isAdmin ? 'bg-[#0f1115]' : 'bg-[#0f172a]'}`}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
         <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse transition-colors duration-500 ${isAdmin ? 'bg-indigo-900/20' : 'bg-cyan-500/10'}`}></div>
         <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 animate-pulse transition-colors duration-500 ${isAdmin ? 'bg-purple-900/20' : 'bg-purple-600/10'}`} style={{ animationDelay: '2s' }}></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="flex justify-center mb-4">
             <div className="relative">
                <div className={`absolute inset-0 blur-xl rounded-full transition-colors duration-500 ${isAdmin ? 'bg-indigo-500/40' : 'bg-cyan-500/30'}`}></div>
                <Logo className="w-20 h-20 relative z-10" />
             </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            VAPO<span className={`transition-colors duration-300 ${isAdmin ? 'text-indigo-400' : 'text-cyan-400'}`}>BET</span>
          </h1>
          <p className={`text-sm tracking-wide uppercase font-bold transition-colors duration-300 ${isAdmin ? 'text-indigo-300' : 'text-slate-400'}`}>
            {isAdmin ? 'Área Restrita do Tipster' : 'O Sistema dos Vencedores'}
          </p>
        </div>

        <div className={`backdrop-blur-xl border rounded-2xl p-8 shadow-2xl animate-scale-up transition-colors duration-500 ${isAdmin ? 'bg-slate-900/80 border-indigo-500/30 shadow-indigo-900/20' : 'bg-slate-900/50 border-slate-700/50'}`}>
          
          {/* USER MODE TABS */}
          {!isAdmin && (
            <div className="flex gap-4 mb-8 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
               <button 
                  onClick={() => { setIsLogin(true); setError(null); setRegistrationSuccess(false); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                  Entrar
               </button>
               <button 
                  onClick={() => { setIsLogin(false); setError(null); setRegistrationSuccess(false); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                  Criar Conta
               </button>
            </div>
          )}

          {/* ADMIN MODE HEADER */}
          {isAdmin && (
              <div className="mb-6 flex items-center justify-center gap-2 text-indigo-400 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                  <Shield size={20} />
                  <span className="font-bold text-sm uppercase tracking-wider">Acesso Administrativo</span>
              </div>
          )}

          {/* SUCESSO NO REGISTRO */}
          {registrationSuccess && (
             <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 animate-fade-in">
                <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
                <div>
                   <h4 className="text-emerald-400 font-bold text-sm">Conta criada com sucesso!</h4>
                   <p className="text-emerald-200/70 text-xs mt-1">Verifique seu e-mail para confirmar a conta antes de fazer login.</p>
                </div>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isAdmin && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-xs text-slate-400 font-bold uppercase ml-1">Nome de Usuário</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <input 
                    type="text"
                    required={!isLogin}
                    placeholder="Ex: VapoMaster"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-bold uppercase ml-1">E-mail</label>
              <div className="relative group">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isAdmin ? 'text-indigo-400' : 'text-slate-500 group-focus-within:text-cyan-400'}`} size={18} />
                <input 
                  type="email"
                  required
                  placeholder={isAdmin ? "admin@vapobet.com" : "seu@email.com"}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full bg-slate-950 border rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none transition-all ${isAdmin ? 'border-indigo-500/50 focus:border-indigo-500' : 'border-slate-800 focus:border-cyan-500'}`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-bold uppercase ml-1">Senha</label>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isAdmin ? 'text-indigo-400' : 'text-slate-500 group-focus-within:text-cyan-400'}`} size={18} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full bg-slate-950 border rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none transition-all ${isAdmin ? 'border-indigo-500/50 focus:border-indigo-500' : 'border-slate-800 focus:border-cyan-500'}`}
                />
              </div>
            </div>

            {error && (
               <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-sm animate-shake">
                  <AlertCircle size={16} /> {error}
               </div>
            )}

            <button 
               type="submit"
               disabled={isLoading}
               className={`w-full py-4 mt-2 bg-gradient-to-r text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed ${isAdmin ? 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-900/20' : 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/20'}`}
            >
               {isLoading ? (
                 <Loader2 className="animate-spin" />
               ) : (
                 <>
                   {isAdmin ? 'Acessar Painel' : (isLogin ? 'Entrar na Plataforma' : 'Criar Conta Grátis')} <ArrowRight size={18} />
                 </>
               )}
            </button>
          </form>

          {/* TEST CONNECTION BUTTON (Only visible in User Mode) */}
          {!isAdmin && (
              <button 
                type="button" 
                onClick={handleCreateTestUser}
                disabled={isLoading}
                className="w-full mt-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-500 text-xs rounded-lg flex items-center justify-center gap-2 transition-all group"
              >
                  {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} className="group-hover:text-cyan-400" />}
                  Teste de Integração (Supabase)
              </button>
          )}

          {/* Toggle Modes */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
             {!isAdmin ? (
                 <button 
                    onClick={switchToAdmin}
                    className="text-[10px] uppercase font-bold text-slate-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-1 w-full"
                 >
                    <Shield size={12} /> Acesso Tipster (Admin)
                 </button>
             ) : (
                 <button 
                    onClick={switchToUser}
                    className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 w-full"
                 >
                    <ArrowLeft size={14} /> Voltar para Área de Membros
                 </button>
             )}
          </div>
        </div>
        
        <p className="text-center text-[10px] text-slate-600 mt-8">
           &copy; 2024 VapoBet SaaS Corporation. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
