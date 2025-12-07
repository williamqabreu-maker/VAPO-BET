
import React, { useState } from 'react';
import { Bet, BetResult, BankrollSettings } from '../types';
import { BetDetailsModal } from './BetDetailsModal';
import { MoneyRain } from './MoneyRain';
import { CheckCircle2, XCircle, MinusCircle, Clock, Trash2, Send, ExternalLink, MessageSquare, Eye, Calendar, Filter, X, Download } from 'lucide-react';

interface BetListProps {
  bets: Bet[];
  onDelete: (id: string) => void;
  onClear: () => void;
  settings: BankrollSettings;
  onUpdateBet?: (id: string, updates: Partial<Bet>) => void;
  userRole?: 'admin' | 'user';
}

export const BetList: React.FC<BetListProps> = ({ bets, onDelete, onClear, settings, onUpdateBet, userRole }) => {
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showRain, setShowRain] = useState(false);

  // Calculate Unit Value based on settings
  const unitValue = settings.startBankroll / settings.unitDivisor;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getResultColor = (result: BetResult) => {
    switch (result) {
      case BetResult.WIN: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case BetResult.LOSS: return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case BetResult.VOID: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getResultIcon = (result: BetResult) => {
    switch (result) {
      case BetResult.WIN: return <CheckCircle2 size={16} strokeWidth={2.5} />;
      case BetResult.LOSS: return <XCircle size={16} strokeWidth={2.5} />;
      case BetResult.VOID: return <MinusCircle size={16} strokeWidth={2.5} />;
      default: return <Clock size={16} strokeWidth={2.5} />;
    }
  };

  // Filter bets based on date range
  const filteredBets = bets.filter(bet => {
    if (startDate && bet.date < startDate) return false;
    if (endDate && bet.date > endDate) return false;
    return true;
  });

  // Sort by newest first
  const sortedBets = [...filteredBets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExportCSV = () => {
    if (sortedBets.length === 0) return;

    const headers = ['Data', 'Esporte', 'Mercado', 'Seleção', 'Odds', 'Stake (U)', 'Stake (R$)', 'Resultado', 'Lucro/Prejuízo (U)', 'Lucro/Prejuízo (R$)', 'Análise', 'Link', 'Enviado VIP'];

    const csvRows = sortedBets.map(bet => {
        const stakeMoney = bet.stakeUnits * unitValue;
        const profitMoney = (bet.profitUnits || 0) * unitValue;

        const row = [
            new Date(bet.date).toLocaleDateString('pt-BR'),
            bet.sport,
            bet.market,
            bet.selection,
            bet.odds.toFixed(2).replace('.', ','),
            bet.stakeUnits.toFixed(2).replace('.', ','),
            stakeMoney.toFixed(2).replace('.', ','),
            bet.result === BetResult.VOID ? 'REEMBOLSO' : bet.result,
            (bet.profitUnits || 0).toFixed(2).replace('.', ','),
            profitMoney.toFixed(2).replace('.', ','),
            bet.analysis || '',
            bet.link || '',
            bet.sentToGroup ? 'Sim' : 'Não'
        ];

        // Escape quotes and wrap fields with commas in quotes
        return row.map(field => {
            const stringField = String(field);
            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        }).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Add BOM for Excel compatibility with UTF-8 characters
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vapobet_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickWin = (e: React.MouseEvent, bet: Bet) => {
      e.stopPropagation();
      if (onUpdateBet) {
          const profit = (bet.stakeUnits * bet.odds) - bet.stakeUnits;
          
          // Trigger Rain Locally
          const winAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); 
          winAudio.play().catch(e => console.log(e));
          setShowRain(true);
          setTimeout(() => setShowRain(false), 5000);

          onUpdateBet(bet.id, { 
              result: BetResult.WIN,
              profitUnits: profit
          });
      }
  };

  return (
    <>
      {showRain && <MoneyRain />}
      
      <style>{`
        @keyframes subtleFadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-row-entry {
          animation: subtleFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0; /* Start hidden */
        }
        .animate-pop-in {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-display text-slate-100 flex items-center gap-2">
              Histórico de Entradas
              {(startDate || endDate) && (
                 <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                   Filtrado
                 </span>
              )}
            </h3>
            <span className="text-xs text-slate-500 font-mono">{sortedBets.length} de {bets.length} Registros</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
             <div className="relative group flex-1 md:flex-none">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                  <Calendar size={12} className="text-slate-500" />
                </div>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none w-full md:w-32 transition-colors placeholder:text-slate-600"
                />
                <span className="absolute -top-2 left-2 bg-slate-800 px-1 text-[9px] text-slate-500 uppercase font-bold tracking-wider">De</span>
             </div>
             
             <span className="text-slate-600 hidden md:inline">-</span>

             <div className="relative group flex-1 md:flex-none">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                  <Calendar size={12} className="text-slate-500" />
                </div>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none w-full md:w-32 transition-colors"
                />
                <span className="absolute -top-2 left-2 bg-slate-800 px-1 text-[9px] text-slate-500 uppercase font-bold tracking-wider">Até</span>
             </div>

             {(startDate || endDate) && (
                <button 
                  onClick={() => {setStartDate(''); setEndDate('');}}
                  className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                  title="Limpar Filtros"
                >
                  <X size={16} /> 
                </button>
             )}

             <div className="w-px h-6 bg-slate-700 mx-1 hidden md:block"></div>

             <button
                onClick={handleExportCSV}
                disabled={sortedBets.length === 0}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-slate-600 shadow-sm"
                title="Exportar CSV"
             >
                <Download size={14} />
                <span className="hidden sm:inline">CSV</span>
             </button>

             <button
                onClick={onClear}
                disabled={bets.length === 0}
                className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-rose-500/20"
                title="Limpar Histórico"
             >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Limpar</span>
             </button>
          </div>
        </div>
        
        {sortedBets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
               {bets.length > 0 ? <Filter size={32} className="text-slate-600" /> : <Clock size={32} className="text-slate-600" />}
            </div>
            <p className="text-slate-400">
               {bets.length > 0 ? "Nenhuma aposta encontrada neste período." : "Nenhuma aposta registrada ainda."}
            </p>
            {bets.length > 0 && (
                <button onClick={() => {setStartDate(''); setEndDate('');}} className="text-xs text-cyan-400 mt-2 hover:underline">
                    Limpar filtros
                </button>
            )}
            {bets.length === 0 && (
                <p className="text-xs text-slate-600 mt-2">Clique em "Nova Aposta" para começar.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Esporte / Mercado</th>
                  <th className="px-6 py-3 text-right">Stake</th>
                  <th className="px-6 py-3 text-right">Odds</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">P/L</th>
                  <th className="px-6 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedBets.map((bet, index) => (
                  <tr 
                    key={`${bet.id}-${bet.result}`} 
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-all duration-300 group animate-row-entry"
                    style={{ animationDelay: `${Math.min(index * 0.03, 1.0)}s` }}
                  >
                    <td className="px-6 py-4 font-medium text-slate-300 whitespace-nowrap">
                      <div className="flex flex-col">
                          <span>{new Date(bet.date).toLocaleDateString('pt-BR')}</span>
                          <div className="flex gap-1 mt-1">
                            {bet.sentToGroup && (
                                <span className="flex items-center gap-1 text-[10px] text-cyan-400 uppercase tracking-wider bg-cyan-500/10 w-fit px-1.5 py-0.5 rounded border border-cyan-500/20">
                                    <Send size={10} /> VIP
                                </span>
                            )}
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                          <div className="flex-1">
                              <div className="font-medium text-slate-200">{bet.selection}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-2">
                                  {bet.sport} • {bet.market}
                              </div>
                              {bet.analysis && (
                                  <div className="mt-1.5 relative group/tooltip w-fit md:hidden lg:block">
                                    <div className="text-xs text-slate-500 italic flex items-center gap-1 cursor-help hover:text-cyan-400 transition-colors">
                                      <MessageSquare size={12} />
                                      <span className="truncate max-w-[200px] block">"{bet.analysis}"</span>
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-64 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                                      <div className="font-bold text-slate-400 mb-1 border-b border-slate-800 pb-1">Análise do Apostador</div>
                                      {bet.analysis}
                                      {/* Arrow */}
                                      <div className="absolute left-4 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-700"></div>
                                    </div>
                                  </div>
                              )}
                          </div>
                          {bet.link && (
                            <a 
                              href={bet.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="mt-0.5 text-slate-500 hover:text-cyan-400 transition-colors shrink-0"
                              title="Abrir Link da Aposta"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-slate-300 font-mono">{bet.stakeUnits.toFixed(2)}u</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                            {formatCurrency(bet.stakeUnits * unitValue)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-cyan-300 font-mono">
                      @{bet.odds.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span 
                        key={`${bet.id}-${bet.result}`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border animate-pop-in ${getResultColor(bet.result)}`}
                      >
                        {getResultIcon(bet.result)}
                        {bet.result === BetResult.VOID ? 'REEMBOLSO' : bet.result}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold font-mono ${
                      (bet.profitUnits || 0) > 0 ? 'text-emerald-400' : 
                      (bet.profitUnits || 0) < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      <div className="flex flex-col items-end">
                          <span>{(bet.profitUnits || 0) > 0 ? '+' : ''}{(bet.profitUnits || 0).toFixed(2)}u</span>
                          <span className="text-[10px] opacity-70 font-medium">
                             {formatCurrency((bet.profitUnits || 0) * unitValue)}
                          </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* QUICK WIN BUTTON - Admin Only */}
                        {userRole === 'admin' && bet.result === BetResult.PENDING && (
                            <button 
                              onClick={(e) => handleQuickWin(e, bet)}
                              className="text-emerald-500 hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-500/10"
                              title="Green Rápido"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                        )}

                        <button 
                          onClick={() => setSelectedBet(bet)}
                          className="text-slate-500 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-cyan-500/10"
                          title="Ver Detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(bet.id)}
                          className="text-slate-600 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-rose-500/10"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBet && (
        <BetDetailsModal 
          bet={selectedBet} 
          onClose={() => setSelectedBet(null)} 
          onDelete={onDelete}
          settings={settings}
          onUpdate={onUpdateBet}
          userRole={userRole}
        />
      )}
    </>
  );
};
