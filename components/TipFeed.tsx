

import React from 'react';
import { Bet, BetResult } from '../types';
import { ExternalLink, Clock, Copy, Trophy, Target, TrendingUp, Zap, AlertTriangle, ThermometerSun, Diamond, Gift, Lock, Crown } from 'lucide-react';

interface TipFeedProps {
  bets?: Bet[];
  userPlan?: 'free' | 'pro';
  userRole?: 'admin' | 'user';
}

export const TipFeed: React.FC<TipFeedProps> = ({ bets = [], userPlan = 'free', userRole = 'user' }) => {
  // Filter only bets marked as "Sent to Group" (PRO/FREE Signals)
  const signals = bets
    .filter(b => b.sentToGroup)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Link copiado!');
  };

  const renderConfidenceThermometer = (confidence: number = 5) => {
    // 1-10 Scale
    let activeColorClass = 'bg-cyan-500';
    if (confidence >= 10) activeColorClass = 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]';
    else if (confidence >= 8) activeColorClass = 'bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.6)]';
    else if (confidence >= 5) activeColorClass = 'bg-yellow-400';

    return (
        <div className="flex flex-col gap-1 w-full mt-1">
            <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <span className="flex items-center gap-1"><ThermometerSun size={10} /> Confiança</span>
                <span className={confidence >= 8 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}>
                    {confidence}/10
                </span>
            </div>
            <div className="flex gap-0.5 h-1.5 w-full">
                {[...Array(10)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 rounded-sm transition-all duration-500 ${
                            i < confidence ? activeColorClass : 'bg-slate-800'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
  };

  // Helper to check if user has access to the specific tip
  const hasAccess = (bet: Bet) => {
      if (userRole === 'admin') return true;
      if (bet.tipType === 'free') return true;
      // If tip is PRO, user must be PRO
      if (bet.tipType === 'pro' && userPlan === 'pro') return true;
      return false;
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-cyan-900/20 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </div>
            Feed de Tips Ao Vivo
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-lg">
            Acompanhe as entradas do Tipster em tempo real. Identifique facilmente entradas PRO e Free.
          </p>
        </div>
      </div>

      {signals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <Zap size={48} className="text-slate-700 mb-4" />
          <h3 className="text-slate-300 font-display text-lg mb-2">Aguardando Sinais...</h3>
          <p className="text-slate-500 text-sm">
            Assim que o Tipster enviar uma entrada, ela aparecerá aqui instantaneamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {signals.map((bet) => {
            const isFree = bet.tipType === 'free';
            const userCanView = hasAccess(bet);
            
            // Render LOCKED Card for Free Users on PRO Tips
            if (!userCanView) {
                return (
                    <div key={bet.id} className="relative rounded-2xl p-5 border border-yellow-900/50 bg-[#0a0a0f] overflow-hidden group">
                         {/* Blur Effect Overlay */}
                         <div className="absolute inset-0 z-10 backdrop-blur-md bg-slate-950/60 flex flex-col items-center justify-center text-center p-6">
                             <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mb-4 border border-yellow-500/30 animate-pulse">
                                 <Lock size={32} className="text-yellow-400" />
                             </div>
                             <h3 className="text-xl font-display font-bold text-white mb-2">CONTEÚDO PRO</h3>
                             <p className="text-slate-400 text-sm max-w-xs mb-6">Esta entrada é exclusiva para assinantes PRO. Assine agora para desbloquear.</p>
                             <button className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-yellow-900/40 transition-all transform hover:scale-105">
                                 DESBLOQUEAR ACESSO
                             </button>
                         </div>

                         {/* Background Dummy Content (Blurred) */}
                         <div className="opacity-30 filter blur-sm select-none pointer-events-none">
                            <div className="absolute top-0 left-0">
                                <div className="px-3 py-1 bg-yellow-600 text-white rounded-br-xl text-[10px] font-black uppercase flex items-center gap-1">
                                    <Crown size={12} /> PRO ONLY
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mb-4 mt-6">
                                <div className="w-10 h-10 rounded-full bg-yellow-900/20 border border-yellow-500/30"></div>
                                <div>
                                    <div className="h-4 w-24 bg-slate-800 rounded mb-1"></div>
                                    <div className="h-3 w-16 bg-slate-800 rounded"></div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="h-6 w-3/4 bg-slate-800 rounded mb-2"></div>
                                <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
                            </div>
                            <div className="flex gap-4 p-3 bg-slate-900 rounded-xl">
                                <div className="h-8 w-1/3 bg-slate-800 rounded"></div>
                                <div className="h-8 w-1/3 bg-slate-800 rounded"></div>
                                <div className="h-8 w-1/3 bg-slate-800 rounded"></div>
                            </div>
                         </div>
                    </div>
                );
            }

            // Render NORMAL Card (If allowed)
            return (
            <div 
              key={bet.id} 
              className={`border rounded-2xl p-5 shadow-lg transition-all group relative overflow-hidden ${
                  isFree 
                  ? 'bg-slate-900 border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-900/10' 
                  : 'bg-gradient-to-br from-slate-900 to-amber-950/20 border-yellow-500/30 hover:border-yellow-500/50 shadow-yellow-900/10'
              }`}
            >
              {/* Type Badge (PRO/FREE) */}
              <div className="absolute top-0 left-0">
                  <div className={`px-3 py-1 rounded-br-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg ${
                      isFree 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-yellow-600 text-black'
                  }`}>
                      {isFree ? <Gift size={12} /> : <Crown size={12} />}
                      {isFree ? 'FREE BET' : 'PRO ONLY'}
                  </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {bet.result === BetResult.PENDING ? (
                   <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                     <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                     OPEN
                   </span>
                ) : (
                   <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                     bet.result === BetResult.WIN ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                     bet.result === BetResult.LOSS ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                     'bg-slate-500/10 text-slate-400 border-slate-500/20'
                   }`}>
                     {bet.result === BetResult.VOID ? 'REEMBOLSO' : bet.result}
                   </span>
                )}
              </div>

              {/* Header Info */}
              <div className="flex items-center gap-3 mb-4 mt-6">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                     isFree ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400'
                 }`}>
                    <Trophy size={18} />
                 </div>
                 <div>
                    <h4 className="text-slate-200 font-bold text-sm">{bet.sport}</h4>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                       <Clock size={10} /> {new Date(bet.date).toLocaleDateString('pt-BR')}
                    </span>
                 </div>
              </div>

              {/* Main Selection */}
              <div className="mb-4 pl-1">
                 <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Target size={12} /> Seleção
                 </p>
                 <h3 className="text-xl font-display font-bold text-white mb-1">
                    {bet.selection}
                 </h3>
                 <p className="text-sm font-medium opacity-80" style={{ color: isFree ? '#34d399' : '#facc15' }}>
                    {bet.market}
                 </p>
              </div>

              {/* Stats Row */}
              <div className="flex flex-col gap-3 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                 <div className="flex gap-4">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase">Odd</p>
                        <p className={`text-lg font-mono font-bold ${isFree ? 'text-emerald-400' : 'text-yellow-400'}`}>@{bet.odds.toFixed(2)}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-800 self-center"></div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase">Stake</p>
                        <p className="text-lg font-mono font-bold text-white">{bet.stakeUnits}u</p>
                    </div>
                    <div className="w-px h-8 bg-slate-800 self-center"></div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase">Retorno</p>
                        <p className="text-lg font-mono font-bold text-slate-200">
                        {((bet.odds * bet.stakeUnits) - bet.stakeUnits).toFixed(2)}u
                        </p>
                    </div>
                 </div>
                 
                 {/* Confidence Thermometer */}
                 <div className="border-t border-slate-800 pt-2">
                    {renderConfidenceThermometer(bet.confidence)}
                 </div>
              </div>

              {/* Analysis/Obs */}
              {bet.analysis && (
                 <div className="mb-4 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 text-sm text-slate-300 italic">
                    "{bet.analysis}"
                 </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-2">
                 {bet.link ? (
                    <a 
                      href={bet.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex-1 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg ${
                          isFree 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' 
                          : 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-yellow-900/20'
                      }`}
                    >
                       <ExternalLink size={18} />
                       PEGAR ENTRADA
                    </a>
                 ) : (
                    <div className="flex-1 bg-slate-800 text-slate-500 py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700">
                       <AlertTriangle size={18} />
                       Sem Link Disponível
                    </div>
                 )}
                 
                 {bet.link && (
                    <button 
                       onClick={() => handleCopyLink(bet.link!)}
                       className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors"
                       title="Copiar Link"
                    >
                       <Copy size={20} />
                    </button>
                 )}
              </div>

            </div>
          )}})}
        </div>
      )}
    </div>
  );
};