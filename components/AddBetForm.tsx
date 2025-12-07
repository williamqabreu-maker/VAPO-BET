

import React, { useState } from 'react';
import { BetResult } from '../types';
import { Plus, X, Send, MessageSquare, Link, Globe, ThermometerSun, Flame, Lock, BellRing, Radio, Gift, Diamond, ShieldCheck, Crown } from 'lucide-react';

interface AddBetFormProps {
  onAdd: (betData: any) => void;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'info') => void;
  userRole?: 'admin' | 'user';
}

type DistributionType = 'personal' | 'pro' | 'free';

export const AddBetForm: React.FC<AddBetFormProps> = ({ onAdd, onClose, onShowToast, userRole }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sport: 'Futebol',
    market: 'Match Odds',
    selection: '',
    odds: '',
    stakeUnits: '',
    analysis: '',
    link: '',
    confidence: 5, // Default confidence
    result: BetResult.PENDING as BetResult
  });

  const [distType, setDistType] = useState<DistributionType>('personal');
  const isAdmin = userRole === 'admin';

  // Helper to get color based on confidence
  const getConfidenceColor = (level: number) => {
    if (level >= 10) return 'text-purple-400';
    if (level >= 8) return 'text-rose-500';
    if (level >= 5) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  const getConfidenceLabel = (level: number) => {
    if (level >= 10) return 'MAX BET 💣';
    if (level >= 8) return 'Alta Confiança 🔥';
    if (level >= 5) return 'Média / Padrão 👍';
    return 'Exploratória / Baixa 🧊';
  };

  const generateSignalText = () => {
    const fireEmojis = '🔥'.repeat(Math.ceil(formData.confidence / 2));
    const header = distType === 'free' 
        ? `🎁 *VAPOBET FREE TIP* 🎁` 
        : `👑 *VAPOBET PRO SIGNAL* 👑`;
    
    return `${header}\n\n` +
      `⚽ *Esporte:* ${formData.sport}\n` +
      `📊 *Mercado:* ${formData.market}\n` +
      `🎯 *Seleção:* ${formData.selection}\n\n` +
      `🌡️ *Confiança:* ${formData.confidence}/10 ${fireEmojis}\n` +
      `💰 *Odd:* @${Number(formData.odds).toFixed(2)}\n` +
      `💎 *Stake:* ${formData.stakeUnits}u\n` +
      `${formData.analysis ? `\n📝 *Análise:* ${formData.analysis}\n` : ''}` +
      `${formData.link ? `\n🔗 *Link:* ${formData.link}\n` : ''}` +
      `\n🔥 *Gestão VAPOBET*`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Force distType to personal if not admin
    const finalDistType = isAdmin ? distType : 'personal';
    const sentToGroup = finalDistType !== 'personal';

    const betData = {
      ...formData,
      odds: Number(formData.odds),
      stakeUnits: Number(formData.stakeUnits),
      sentToGroup: sentToGroup,
      tipType: sentToGroup ? finalDistType : undefined
    };

    onAdd(betData);

    if (sentToGroup) {
      const text = generateSignalText();
      
      // Attempt to use Web Share API or Fallback to Clipboard
      if (navigator.share) {
        try {
          await navigator.share({
            title: `VAPOBET ${finalDistType === 'free' ? 'FREE' : 'PRO'}`,
            text: text,
          });
          onShowToast('Enviado para todos os usuários!', 'info');
        } catch (err) {
          console.log('Share cancelled or failed');
        }
      } else {
        // Just broadcast internally
        onShowToast(`🚀 Notificação ${finalDistType === 'free' ? 'FREE' : 'PRO'} enviada!`, 'success');
      }
    } else {
      onShowToast('Aposta registrada com sucesso!', 'success');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-900/20 animate-fade-in-up my-auto">
        <div className="bg-slate-800/50 p-4 border-b border-slate-700/50 flex justify-between items-center sticky top-0 backdrop-blur-md z-10 rounded-t-2xl">
          <h2 className="text-xl font-display text-white flex items-center gap-2">
            <Plus className="text-cyan-400" /> Nova Entrada
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase tracking-wide">Data</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase tracking-wide">Esporte</label>
              <select
                value={formData.sport}
                onChange={e => setFormData({...formData, sport: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none transition-all"
              >
                <option>Futebol</option>
                <option>Basquete</option>
                <option>Tênis</option>
                <option>E-Sports</option>
                <option>Outro</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase tracking-wide">Mercado</label>
            <input
              type="text"
              required
              placeholder="Ex: Over 2.5 Goals"
              value={formData.market}
              onChange={e => setFormData({...formData, market: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase tracking-wide">Seleção (Time/Jogador)</label>
            <input
              type="text"
              required
              placeholder="Ex: Real Madrid"
              value={formData.selection}
              onChange={e => setFormData({...formData, selection: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase tracking-wide">Odds</label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                required
                placeholder="2.00"
                value={formData.odds}
                onChange={e => setFormData({...formData, odds: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none transition-all font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase tracking-wide">Stake (Unidades)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                placeholder="1.0"
                value={formData.stakeUnits}
                onChange={e => setFormData({...formData, stakeUnits: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          {/* Confidence Slider */}
          <div className="space-y-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
             <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
                   <ThermometerSun size={14} className={getConfidenceColor(formData.confidence)} /> 
                   Termômetro de Confiança
                </label>
                <span className={`text-xs font-bold ${getConfidenceColor(formData.confidence)}`}>
                   {formData.confidence}/10
                </span>
             </div>
             
             <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={formData.confidence}
                onChange={(e) => setFormData({...formData, confidence: Number(e.target.value)})}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
             />
             
             <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-600 font-mono">1</span>
                <span className={`text-xs font-bold transition-colors ${getConfidenceColor(formData.confidence)}`}>
                   {getConfidenceLabel(formData.confidence)}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">10</span>
             </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
               <MessageSquare size={12} /> Análise / Obs (Opcional)
             </label>
             <textarea
                rows={3}
                placeholder="Descreva o motivo da entrada, valor esperado ou contexto do jogo..."
                value={formData.analysis}
                onChange={e => setFormData({...formData, analysis: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none transition-all resize-none leading-relaxed"
             />
          </div>

          {/* DISTRIBUTION SELECTOR - ADMIN ONLY */}
          {isAdmin && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs text-slate-400 uppercase tracking-wide block mb-2">Distribuição da Tip</label>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setDistType('personal')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            distType === 'personal' 
                            ? 'bg-slate-700 border-slate-500 text-white shadow-lg' 
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                        <Lock size={20} />
                        <span className="text-[10px] font-bold uppercase">Pessoal</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setDistType('pro')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            distType === 'pro' 
                            ? 'bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                        <Crown size={20} className={distType === 'pro' ? 'animate-pulse' : ''} />
                        <span className="text-[10px] font-bold uppercase">PRO Group</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setDistType('free')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            distType === 'free' 
                            ? 'bg-gradient-to-br from-emerald-900 to-teal-900 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                        <Gift size={20} className={distType === 'free' ? 'animate-bounce' : ''} />
                        <span className="text-[10px] font-bold uppercase">Free Bet</span>
                    </button>
                </div>

                {distType !== 'personal' && (
                    <div className="animate-fade-in p-3 rounded-xl border border-cyan-400/30 bg-cyan-900/10 mt-2">
                         <div className="flex items-center gap-2 mb-2">
                             <BellRing size={14} className="text-cyan-400" />
                             <span className="text-xs text-cyan-300 font-bold">
                                 {distType === 'free' ? 'Notificando Grupo Grátis 🎁' : 'Notificando Grupo PRO 👑'}
                             </span>
                         </div>
                         
                         <div className="relative">
                            <input
                                type="url"
                                placeholder="Link da Aposta (Obrigatório para envio)"
                                value={formData.link}
                                onChange={e => setFormData({...formData, link: e.target.value})}
                                className="w-full bg-slate-950 border border-cyan-500/50 rounded-lg pl-3 pr-10 py-2.5 text-white text-xs focus:border-cyan-400 focus:outline-none transition-all placeholder:text-slate-600"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500/50 pointer-events-none">
                                <Globe size={14} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* Lock message for non-admins */}
          {!isAdmin && (
             <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-3 opacity-70">
                <div className="p-1.5 bg-slate-700 rounded-lg"><Lock size={14} className="text-slate-400" /></div>
                <p className="text-[10px] text-slate-500 leading-tight">Envio de Tips para o Feed restrito a administradores. Sua aposta será salva apenas na sua gestão pessoal.</p>
             </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase tracking-wide">Status Inicial</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(BetResult) as Array<keyof typeof BetResult>).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setFormData({...formData, result: BetResult[res]})}
                  className={`p-2 rounded-lg text-xs font-bold transition-all border ${
                    formData.result === BetResult[res]
                      ? res === 'WIN' ? 'bg-emerald-500 text-white border-emerald-400'
                      : res === 'LOSS' ? 'bg-rose-500 text-white border-rose-400'
                      : res === 'VOID' ? 'bg-slate-500 text-white border-slate-400'
                      : 'bg-yellow-500 text-black border-yellow-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {res === 'VOID' ? 'REEMBOLSO' : res}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                distType !== 'personal'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20' 
                : 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/20'
              }`}
            >
              {distType !== 'personal' ? <Send size={20} className="animate-pulse" /> : <Plus size={20} />}
              {distType === 'free' ? 'Publicar Free Tip' : distType === 'pro' ? 'Publicar PRO Tip' : 'Registrar Aposta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};