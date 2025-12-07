import React, { useState } from 'react';
import { Check, X, Shield, Zap, Crown, Loader2, QrCode, CreditCard, Star, ArrowRight, TrendingUp, Lock } from 'lucide-react';
import { User, UserPlan } from '../types';
import { processPayment } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';

interface PricingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'offer' | 'checkout'>('offer');

  const handlePayment = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
          const result = await processPayment(user, 'pro', paymentMethod);
          if (result.success) {
              onSuccess();
              onClose();
          } else {
              alert(result.message);
          }
      } catch (e) {
          alert("Erro no pagamento");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#050608]/95 backdrop-blur-xl p-4 animate-fade-in">
        <div className="w-full max-w-4xl bg-[#0B0D12] border border-slate-800/60 rounded-3xl shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-20 p-2 bg-black/20 rounded-full backdrop-blur-md transition-colors"><X size={20} /></button>
            
            {/* LEFT SIDE - VISUAL & BENEFITS */}
            <div className="relative w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between shrink-0">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-950/40 via-[#0B0D12] to-slate-950 z-0 pointer-events-none"></div>
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full z-0 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <Crown size={12} className="fill-yellow-400" /> Acesso de Elite
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-display font-black text-white leading-tight mb-4">
                        Desbloqueie o <br/>
                        <span className="text-yellow-400 drop-shadow-lg">Poder Máximo</span>
                    </h2>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        Pare de apostar no escuro. Tenha acesso às mesmas informações e estratégias que utilizamos para gerar lucros consistentes todos os dias.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: <TrendingUp size={18} />, text: "Sinais de Alta Precisão (+85% Winrate)", hl: "text-emerald-400" },
                            { icon: <Zap size={18} />, text: "Entradas Ao Vivo (Live Betting)", hl: "text-yellow-400" },
                            { icon: <Shield size={18} />, text: "Gestão de Banca Automatizada", hl: "text-cyan-400" },
                            { icon: <Star size={18} />, text: "Grupo VIP Exclusivo no WhatsApp", hl: "text-purple-400" }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-slate-900/40 border border-white/5 p-3 rounded-xl backdrop-blur-sm">
                                <div className={`p-2 rounded-lg bg-white/5 ${item.hl}`}>{item.icon}</div>
                                <span className="text-slate-200 text-sm font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 mt-8 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 opacity-70">
                        <div className="flex -space-x-2">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0B0D12] bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i*123}`} alt="" className="w-full h-full rounded-full" />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400">+1.2k Membros lucrando agora</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - OFFER & CHECKOUT */}
            <div className="w-full md:w-1/2 bg-[#0F1116] p-8 md:p-10 flex flex-col relative min-h-[500px]">
                {step === 'offer' ? (
                    <div className="flex-1 flex flex-col justify-center animate-fade-in-right">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-white mb-2">Plano VIP Semanal</h3>
                            <div className="flex items-end justify-center gap-1 mb-2">
                                <span className="text-lg text-slate-500 line-through mb-1">R$ 97,00</span>
                                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">R$ 47</span>
                                <span className="text-slate-400 font-medium mb-1">/sem</span>
                            </div>
                            <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded">
                                Oferta por Tempo Limitado
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between text-sm py-3 border-b border-slate-800">
                                <span className="text-slate-400">Duração</span>
                                <span className="text-white font-bold">7 Dias</span>
                            </div>
                            <div className="flex justify-between text-sm py-3 border-b border-slate-800">
                                <span className="text-slate-400">Acesso</span>
                                <span className="text-white font-bold">Imediato & Ilimitado</span>
                            </div>
                            <div className="flex justify-between text-sm py-3 border-b border-slate-800">
                                <span className="text-slate-400">Garantia</span>
                                <span className="text-white font-bold">Risco Zero</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setStep('checkout')}
                            className="group relative w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all transform hover:scale-[1.02] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative flex items-center justify-center gap-2">
                                QUERO ACESSO VIP <ArrowRight size={20} />
                            </span>
                        </button>

                        <button onClick={onClose} className="mt-4 text-xs text-slate-500 hover:text-slate-300 text-center w-full transition-colors pb-4 md:pb-0">
                            Não obrigado, prefiro continuar com acesso limitado.
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col animate-fade-in-right">
                        <button onClick={() => setStep('offer')} className="text-xs text-slate-500 mb-6 hover:text-white flex items-center gap-1 transition-colors w-fit p-1 -ml-1 rounded hover:bg-slate-800">
                            &larr; Voltar
                        </button>
                        
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Lock size={20} className="text-emerald-400" /> Checkout Seguro
                        </h3>

                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold">Resumo do Pedido</p>
                                <p className="text-white font-bold">Acesso VIP (Semanal)</p>
                            </div>
                            <span className="text-xl font-mono font-bold text-emerald-400">R$ 47,00</span>
                        </div>

                        <div className="space-y-3 mb-8">
                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider ml-1">Forma de Pagamento</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                onClick={() => setPaymentMethod('pix')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'pix' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                                >
                                    <QrCode size={24} />
                                    <span className="font-bold text-xs">PIX</span>
                                </button>
                                <button 
                                onClick={() => setPaymentMethod('credit_card')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'credit_card' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                                >
                                    <CreditCard size={24} />
                                    <span className="font-bold text-xs">Cartão</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button 
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Shield size={20} />}
                                {loading ? 'Processando...' : 'Pagar e Ativar Agora'}
                            </button>
                            
                            <div className="flex items-center justify-center gap-4 mt-4 opacity-50 grayscale pb-4 md:pb-0">
                                <span className="text-[10px] text-slate-400 font-bold">PAGAMENTO SEGURO</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};