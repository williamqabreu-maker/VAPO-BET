
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bet, BetResult, BankrollStats, BankrollSettings, DreamItem, CommunityPost } from '../types';
import { StatsCard } from './StatsCard';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Target, Wallet, Activity, Flame, Snowflake, Trophy, Edit2, Rocket, Sparkles, Plus, ArrowRight, MessageCircle, Settings2, CheckCircle2, XCircle, CalendarDays, Video, Save, Trash2, Play, Crown } from 'lucide-react';

interface DashboardProps {
  stats: BankrollStats;
  bets: Bet[];
  settings: BankrollSettings;
  onOpenSettings: () => void;
  dreamItems: DreamItem[];
  onNavigateToDreams: () => void;
  communityPosts?: CommunityPost[];
  onNavigateToCommunity?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, bets, settings, onOpenSettings, dreamItems, onNavigateToDreams, onNavigateToCommunity 
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Featured Video State
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState('');
  const [videoInput, setVideoInput] = useState('');

  useEffect(() => {
      const savedVideo = localStorage.getItem('vapobet_featured_video');
      if (savedVideo) {
          setFeaturedVideoUrl(savedVideo);
          setVideoInput(savedVideo);
      }
  }, []);

  const handleSaveVideo = () => {
      if (videoInput.trim()) {
          localStorage.setItem('vapobet_featured_video', videoInput);
          setFeaturedVideoUrl(videoInput);
      }
  };

  const handleClearVideo = () => {
      localStorage.removeItem('vapobet_featured_video');
      setFeaturedVideoUrl('');
      setVideoInput('');
  };
  
  // Calculate cumulative profit and ROI for chart
  const chartData = React.useMemo(() => {
    let cumulativeProfit = 0;
    let cumulativeStake = 0;

    const sortedBets = [...bets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Create an initial point at 0,0 for better visualization
    const initialPoint = {
        name: '0',
        label: 'Início',
        profit: 0,
        roi: 0,
        date: '---'
    };

    const dataPoints = sortedBets.reduce((acc, bet, index) => {
      if (bet.result !== BetResult.PENDING && bet.result !== BetResult.VOID) {
        cumulativeProfit += bet.profitUnits || 0;
        cumulativeStake += bet.stakeUnits || 0;
        
        const currentRoi = cumulativeStake > 0 ? (cumulativeProfit / cumulativeStake) * 100 : 0;

        acc.push({
          name: `${acc.length}`, // Sequential ID for X Axis
          label: `Aposta ${index + 1}`,
          profit: Number(cumulativeProfit.toFixed(2)),
          roi: Number(currentRoi.toFixed(2)),
          date: new Date(bet.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        });
      }
      return acc;
    }, [initialPoint] as any[]);

    return dataPoints;
  }, [bets]);

  // Financial Calculations
  const unitValue = settings.startBankroll / settings.unitDivisor;
  const currentProfitMoney = stats.totalProfitUnits * unitValue;
  const currentBankrollMoney = settings.startBankroll + currentProfitMoney;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  // Goal Progress
  const goalProgress = Math.min(Math.max((stats.totalProfitUnits / settings.profitGoal) * 100, 0), 100);
  const isGoalMet = stats.totalProfitUnits >= settings.profitGoal;

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const displayMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  // MOCK DATA for Official Tipster Results
  const officialResults = [
    { id: 1, selection: 'Lakers -5.5', market: 'Handicap', odds: 1.90, result: 'WIN', profit: 0.90 },
    { id: 2, selection: 'Man City ML', market: 'Match Odds', odds: 1.55, result: 'WIN', profit: 0.55 },
    { id: 3, selection: 'Over 2.5 Gols', market: 'Goals', odds: 2.10, result: 'LOSS', profit: -1.00 },
    { id: 4, selection: 'Djokovic 2-0', market: 'Set Betting', odds: 1.85, result: 'WIN', profit: 0.85 },
  ];
  
  const officialTotalProfit = 27.8; 
  const officialStats = { total: 84, greens: 56, reds: 28 };

  const renderStreakCard = () => {
    const streakValue = Math.abs(stats.currentStreak);
    const isWin = stats.currentStreak > 0;
    const isLoss = stats.currentStreak < 0;
    const maxVisualBars = 5;

    return (
        <div className={`
            relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg
            ${isWin 
                ? 'bg-slate-800/40 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/10' 
                : isLoss 
                ? 'bg-slate-800/40 border-rose-500/20 hover:border-rose-500/40 hover:shadow-rose-500/10'
                : 'bg-slate-800/40 border-slate-700/50'}
        `}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-slate-400 text-xs font-display uppercase tracking-wider mb-1">Momentum</p>
                    <h3 className={`text-2xl font-bold font-display flex items-center gap-2 ${
                        isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-100'
                    }`}>
                        {streakValue} {isWin ? 'Wins' : isLoss ? 'Losses' : '-'}
                    </h3>
                </div>
                <div className={`p-2 rounded-lg ${
                    isWin ? 'bg-emerald-500/20 text-emerald-400' : 
                    isLoss ? 'bg-rose-500/20 text-rose-400' : 
                    'bg-slate-700/50 text-slate-400'
                }`}>
                    {isWin ? <Flame size={20} className="animate-pulse" /> : isLoss ? <Snowflake size={20} /> : <Activity size={20} />}
                </div>
            </div>

            <div className="flex gap-1.5 h-2 w-full mt-2">
                {[...Array(maxVisualBars)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 rounded-full transition-all duration-500 ${
                            i < streakValue 
                            ? (isWin 
                                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' 
                                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]') 
                            : 'bg-slate-700/50'
                        }`}
                    />
                ))}
            </div>
            
            <p className="text-[10px] text-slate-500 mt-2 text-right uppercase tracking-wider font-bold">
                {isWin ? 'On Fire 🔥' : isLoss ? 'Ice Cold ❄️' : 'Neutro'}
            </p>
        </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Motivation Board */}
      <div className="bg-gradient-to-br from-slate-900 to-purple-900/20 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-purple-900/10">
            <div className="flex justify-between items-center mb-4 relative z-10">
               <div>
                  <h3 className="text-lg font-display text-white flex items-center gap-2">
                    <Rocket size={18} className="text-purple-400" />
                    Foco & Motivação
                  </h3>
                  <p className="text-xs text-slate-400">Lembre-se do porquê você está no jogo.</p>
               </div>
               <button onClick={onNavigateToDreams} className="text-xs text-purple-300 hover:text-white hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors border border-purple-500/30">
                 Ver Quadro Completo
               </button>
            </div>

            {dreamItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                   {dreamItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-700/50 group relative">
                         {item.type === 'image' ? (
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         ) : (
                            <video src={item.url} className="w-full h-full object-cover opacity-80" muted />
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                            <span className="text-xs font-bold text-white truncate w-full">{item.title}</span>
                         </div>
                      </div>
                   ))}
                   {dreamItems.length < 4 && (
                      <button onClick={onNavigateToDreams} className="aspect-video bg-slate-800/50 rounded-xl border border-dashed border-slate-600 flex flex-col items-center justify-center gap-2 hover:bg-slate-800 hover:border-purple-400 transition-all group">
                         <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                            <Plus size={16} />
                         </div>
                         <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Adicionar</span>
                      </button>
                   )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-700 rounded-xl bg-slate-800/30 relative z-10">
                    <Sparkles size={24} className="text-purple-400 mb-2 opacity-70" />
                    <p className="text-sm text-slate-300 font-medium">Seu quadro dos sonhos está vazio.</p>
                    <button onClick={onNavigateToDreams} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold transition-colors mt-2">
                        Criar Quadro Agora
                    </button>
                </div>
            )}
        </div>
      
      {/* Financial Goal & Stats */}
      <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors"></div>
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${isGoalMet ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                <Trophy size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Meta do Mês</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <h3 className="text-xl font-display font-bold text-white">
                                        {stats.totalProfitUnits.toFixed(2)} <span className="text-slate-500 text-sm">/ {settings.profitGoal}u</span>
                                    </h3>
                                    <button onClick={onOpenSettings} className="p-1 text-slate-500 hover:text-cyan-400 transition-colors" title="Editar Meta">
                                        <Edit2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isGoalMet ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-cyan-400 border-cyan-500/30'}`}>
                            {goalProgress.toFixed(0)}%
                        </span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div className={`h-full rounded-full transition-all duration-1000 ${isGoalMet ? 'bg-gradient-to-r from-emerald-500 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`} style={{ width: `${goalProgress}%` }}></div>
                    </div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-700 mx-2"></div>
                <div className="flex gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <div onClick={onOpenSettings} className="group/item cursor-pointer p-1 rounded hover:bg-slate-800 transition-colors">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">Valor Unidade <Settings2 size={10} /></p>
                        <p className="text-xs text-slate-400 font-mono mb-0.5">1/{settings.unitDivisor}</p>
                        <p className="text-lg font-mono font-bold text-slate-200 group-hover/item:text-cyan-400 transition-colors">R$ {unitValue.toFixed(2)}</p>
                    </div>
                    <div onClick={onOpenSettings} className="text-right sm:text-left group/item cursor-pointer p-1 rounded hover:bg-slate-800 transition-colors">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center justify-end sm:justify-start gap-1">Banca Atual <Edit2 size={10} /></p>
                         <p className="text-xs text-slate-400 font-mono mb-0.5">Inicial: {formatCurrency(settings.startBankroll)}</p>
                        <p className={`text-lg font-mono font-bold group-hover/item:underline decoration-slate-600 underline-offset-4 transition-all ${currentBankrollMoney >= settings.startBankroll ? 'text-emerald-400' : 'text-rose-400'}`}>R$ {currentBankrollMoney.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Cards Grid - 4 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Unidades (Lucro)" value={`${stats.totalProfitUnits > 0 ? '+' : ''}${stats.totalProfitUnits.toFixed(2)}u`} subtitle={`Total: R$ ${currentProfitMoney.toFixed(2)}`} trend={stats.totalProfitUnits >= 0 ? 'up' : 'down'} icon={<Wallet size={20} />} highlight={true} />
                <StatsCard title="ROI (Yield)" value={`${stats.roi.toFixed(1)}%`} subtitle="Retorno sobre Investimento" trend={stats.roi > 0 ? 'up' : 'down'} icon={<TrendingUp size={20} />} />
                <StatsCard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} subtitle={`${stats.totalBets} Apostas Realizadas`} trend={stats.winRate > 50 ? 'up' : 'neutral'} icon={<Target size={20} />} />
                {renderStreakCard()}
            </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm h-full">
                <h3 className="text-lg font-display text-slate-100 mb-6 flex items-center gap-2"><Activity size={18} className="text-cyan-400" /> Curva de Crescimento da Banca</h3>
                <div className="h-[300px] w-full">
                    {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={true} 
                                axisLine={true} 
                                tickFormatter={(val) => val === '0' ? '' : `#${val}`} // Display simple count
                                interval="preserveStartEnd"
                                minTickGap={20}
                            />
                            <YAxis 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(value) => `${value}u`} 
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', fontSize: '12px' }} 
                                itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }} 
                                labelStyle={{ color: '#94a3b8', marginBottom: '4px', display: 'block' }}
                                formatter={(value: number) => [`${value} Unidades`, 'Lucro Acumulado']} 
                                labelFormatter={(label, payload) => {
                                    if (payload && payload.length > 0 && payload[0].payload.date) {
                                        return `${payload[0].payload.date} • ${payload[0].payload.label || 'Início'}`;
                                    }
                                    return '';
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="profit" 
                                stroke="#06b6d4" 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#colorProfit)"
                                dot={{ r: 4, fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 2 }} 
                                activeDot={{ r: 6, fill: '#fff', stroke: '#06b6d4', strokeWidth: 2 }}
                            />
                        </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500"><p>Registre suas apostas para visualizar o gráfico.</p></div>
                    )}
                </div>
            </div>
        </div>

        {/* Widgets Column */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-yellow-950/30 to-slate-900 border border-yellow-500/20 rounded-2xl p-5 shadow-lg shadow-yellow-900/5 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-2xl rounded-full pointer-events-none"></div>
                <div className="flex justify-between items-start mb-4 relative z-10 gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2 flex-wrap">
                           <Logo className="w-5 h-5 text-yellow-500" /> Performance Oficial
                           <span className="flex items-center gap-1 bg-yellow-500 text-black text-[9px] px-1.5 py-0.5 rounded font-black ml-1 shadow-[0_0_10px_rgba(234,179,8,0.4)] animate-pulse">
                               <Crown size={10} className="fill-black" /> VIP
                           </span>
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">Resultados de {displayMonth}</p>
                    </div>
                    <div className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20 flex items-center gap-1 shrink-0"><CalendarDays size={10} /> Mês Atual</div>
                </div>
                <div className="flex items-end justify-between mb-4 border-b border-white/5 pb-4">
                     <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Lucro Mensal</span>
                     <span className="text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">+{officialTotalProfit}u</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-950/50 p-2 rounded-lg text-center border border-white/5"><p className="text-[10px] text-slate-500 uppercase font-bold">Total</p><p className="text-white font-mono font-bold">{officialStats.total}</p></div>
                    <div className="bg-emerald-950/30 p-2 rounded-lg text-center border border-emerald-500/10"><p className="text-[10px] text-emerald-500/70 uppercase font-bold">Greens</p><p className="text-emerald-400 font-mono font-bold">{officialStats.greens}</p></div>
                    <div className="bg-rose-950/30 p-2 rounded-lg text-center border border-rose-500/10"><p className="text-[10px] text-rose-500/70 uppercase font-bold">Reds</p><p className="text-rose-400 font-mono font-bold">{officialStats.reds}</p></div>
                </div>
                <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Últimas do Mês</p>
                    {officialResults.map((result) => (
                        <div key={result.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                {result.result === 'WIN' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                                <span className="text-slate-300 font-medium truncate max-w-[120px]">{result.selection}</span>
                            </div>
                            <div className="text-right flex items-center gap-3">
                                <span className="text-slate-500 font-mono text-xs">@{result.odds.toFixed(2)}</span>
                                <span className={`font-mono font-bold ${result.profit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{result.profit > 0 ? '+' : ''}{result.profit.toFixed(2)}u</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-center">
                    <button onClick={() => onNavigateToCommunity && onNavigateToCommunity()} className="text-xs text-yellow-500 hover:text-yellow-400 uppercase font-bold tracking-wide transition-colors">Ver Histórico do Mês &rarr;</button>
                </div>
            </div>

            {/* FEATURED VIDEO SECTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 overflow-hidden shadow-lg relative group">
                {(featuredVideoUrl || isAdmin) ? (
                    <>
                        <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 flex items-center gap-1 shadow-md">
                            <Play size={10} className="text-red-500 fill-red-500" /> DESTAQUE
                        </div>
                        
                        {/* 1080x1080 Aspect Ratio Container */}
                        <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
                            {featuredVideoUrl ? (
                                <video
                                    src={featuredVideoUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                    playsInline
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                                    <Video size={48} className="opacity-20 mb-2" />
                                    <p className="text-xs uppercase font-bold tracking-widest opacity-50">Sem Vídeo em Destaque</p>
                                </div>
                            )}
                        </div>

                        {/* Admin Controls */}
                        {isAdmin && (
                             <div className="p-3 bg-slate-950 border-t border-slate-800">
                                 <div className="flex gap-2">
                                     <input 
                                        type="text" 
                                        value={videoInput}
                                        onChange={(e) => setVideoInput(e.target.value)}
                                        placeholder="URL do Vídeo (mp4)"
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded text-xs px-2 py-1 text-white focus:border-cyan-500 focus:outline-none"
                                     />
                                     <button onClick={handleSaveVideo} className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"><Save size={14} /></button>
                                     {featuredVideoUrl && (
                                         <button onClick={handleClearVideo} className="p-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-500 hover:text-white rounded transition-colors"><Trash2 size={14} /></button>
                                     )}
                                 </div>
                             </div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
      </div>

      {/* Social Hub */}
      <div className="mt-8 border-t border-slate-800/50 pt-8 pb-12">
            <h3 className="text-center text-sm font-display font-bold text-slate-400 mb-6 uppercase tracking-widest">Conecte-se Conosco</h3>
            <div className="flex flex-wrap justify-center gap-4">
                <a href="#" className="flex items-center gap-3 px-5 py-3 bg-slate-800 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all group border border-slate-700 hover:border-transparent"><div className="p-2 bg-slate-900 rounded-lg group-hover:bg-white/20 transition-colors"><MessageCircle size={20} /></div><div><span className="block text-xs font-bold uppercase tracking-wide opacity-70">Siga no</span><span className="font-display font-bold">Instagram</span></div></a>
                <a href="#" className="flex items-center gap-3 px-5 py-3 bg-slate-800 rounded-xl hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white transition-all group border border-slate-700 hover:border-transparent"><div className="p-2 bg-slate-900 rounded-lg group-hover:bg-white/20 transition-colors"><MessageCircle size={20} /></div><div><span className="block text-xs font-bold uppercase tracking-wide opacity-70">Entre no</span><span className="font-display font-bold">Telegram</span></div></a>
                 <a href="#" className="flex items-center gap-3 px-5 py-3 bg-slate-800 rounded-xl hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-600 hover:text-white transition-all group border border-slate-700 hover:border-transparent"><div className="p-2 bg-slate-900 rounded-lg group-hover:bg-white/20 transition-colors"><MessageCircle size={20} /></div><div><span className="block text-xs font-bold uppercase tracking-wide opacity-70">Assista no</span><span className="font-display font-bold">YouTube</span></div></a>
            </div>
      </div>
    </div>
  );
};
