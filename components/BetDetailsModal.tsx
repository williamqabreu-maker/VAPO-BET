
import React from 'react';
import { Bet, BetResult, BankrollSettings } from '../types';
import { X, ExternalLink, MessageSquare, Target, Hash, Wallet, Calendar, Trophy, Trash2, ThermometerSun, CheckCircle2 } from 'lucide-react';

interface BetDetailsModalProps {
  bet: Bet;
  onClose: () => void;
  onDelete: (id: string) => void;
  settings: BankrollSettings;
  onUpdate?: (id: string, updates: Partial<Bet>) => void;
  userRole?: 'admin' | 'user';
}

export const BetDetailsModal: React.FC<BetDetailsModalProps> = ({ bet, onClose, onDelete, settings, onUpdate, userRole }) => {
  
  // Calculate Monetary Values
  const unitValue = settings.startBankroll / settings.unitDivisor;
  const stakeMoney = bet.stakeUnits * unitValue;
  const profitMoney = (bet.profitUnits || 0) * unitValue;
  const isAdmin = userRole === 'admin';
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getResultColor = (result: BetResult) => {
    switch (result) {
      case BetResult.WIN: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case BetResult.LOSS: return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case BetResult.VOID: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
      default: return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    }
  };

  const handleDelete = () => {
      onDelete(bet.id);
      onClose();
  };

  const handleSetGreen = () => {
      if (onUpdate) {
          const profit = (bet.stakeUnits * bet.odds) - bet.stakeUnits;
          onUpdate(bet.id, { 
              result: BetResult.WIN,
              profitUnits: profit
          });
          onClose();
      }
  };

  const getConfidenceColor = (level: number = 5) => {
    if (level >= 10) return 'text-purple-400';
    if (level >= 8) return 'text-rose-500';
    if (level >= 5) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-800/30">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900 uppercase tracking-wider flex items-center gap-1">
                 <Trophy size={10} /> {bet.sport}
               </span>
               <span className="text-xs text-slate-500 flex items-center gap-1">
                 <Calendar size={10} /> {new Date(bet.date).toLocaleDateString('pt-BR')}
               </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white leading-tight">{bet.selection}</h2>
            <p className="text-slate-400">{bet.market}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
             <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800 flex flex-col items-center text-center">
                <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Hash size={10} /> Odds</p>
                <p className="text-sm font-mono text-cyan-300">@{bet.odds.toFixed(2)}</p>
             </div>
             <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800 flex flex-col items-center text-center">
                <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Wallet size={10} /> Stake</p>
                <div className="flex flex-col">
                    <p className="text-sm font-mono text-slate-200">{bet.stakeUnits}u</p>
                    <p className="text-[9px] text-slate-500">{formatCurrency(stakeMoney)}</p>
                </div>
             </div>
             <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800 flex flex-col items-center text-center">
                 <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><ThermometerSun size={10} /> Conf.</p>
                 <p className={`text-sm font-bold ${getConfidenceColor(bet.confidence)}`}>{bet.confidence || 5}/10</p>
             </div>
             <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800 flex flex-col items-center text-center">
                <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Target size={10} /> Result</p>
                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block border ${getResultColor(bet.result)}`}>
                  {bet.result === BetResult.VOID ? 'REEMBOLSO' : bet.result}
                </div>
             </div>
          </div>

          {/* Profit/Loss Highlight */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
              (bet.profitUnits || 0) > 0 ? 'bg-emerald-950/20 border-emerald-900/50' : 
              (bet.profitUnits || 0) < 0 ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-800/50 border-slate-700'
          }`}>
             <div>
                <span className="text-sm text-slate-400 uppercase tracking-wider font-display block">Resultado P/L</span>
                <span className="text-xs text-slate-500 font-mono">
                    Valor: {formatCurrency(profitMoney)}
                </span>
             </div>
             <span className={`text-2xl font-mono font-bold ${
                 (bet.profitUnits || 0) > 0 ? 'text-emerald-400' : 
                 (bet.profitUnits || 0) < 0 ? 'text-rose-400' : 'text-slate-400'
             }`}>
                {(bet.profitUnits || 0) > 0 ? '+' : ''}{(bet.profitUnits || 0).toFixed(2)}u
             </span>
          </div>

          {/* Analysis */}
          {bet.analysis ? (
            <div className="space-y-2">
               <h4 className="text-sm text-slate-400 font-display flex items-center gap-2">
                 <MessageSquare size={14} className="text-purple-400" /> Análise / Obs
               </h4>
               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                 {bet.analysis}
               </div>
            </div>
          ) : (
            <div className="text-center p-4 border border-dashed border-slate-800 rounded-xl">
                <p className="text-xs text-slate-600">Nenhuma análise registrada para esta aposta.</p>
            </div>
          )}

          {/* Link - Enhanced Visuals */}
          {bet.link && (
             <a 
               href={bet.link}
               target="_blank"
               rel="noopener noreferrer"
               className="relative flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/50 rounded-xl transition-all font-bold group shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:-translate-y-1 overflow-hidden"
             >
               {/* Shiny overlay effect */}
               <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
               
               <ExternalLink size={20} className="group-hover:scale-110 transition-transform" />
               <span className="uppercase tracking-wider">Acessar Link da Aposta</span>
             </a>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
            {isAdmin && bet.result === BetResult.PENDING && (
                <button
                    onClick={handleSetGreen}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-emerald-950 bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <CheckCircle2 size={16} /> MARCAR GREEN (VIP)
                </button>
            )}
            
            <div className="flex-1"></div>

            <button 
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
            >
                <Trash2 size={16} /> Excluir
            </button>
        </div>
      </div>
    </div>
  );
};
