
import React, { useState } from 'react';
import { Bet, AIAnalysisResponse } from '../types';
import { analyzeBettingHistory } from '../services/geminiService';
import { BrainCircuit, Lightbulb, TrendingUp, AlertTriangle, Loader2, Sparkles } from 'lucide-react';

interface AIAnalysisProps {
  bets: Bet[];
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ bets }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null); // Clear previous analysis to show loading state
    try {
      const result = await analyzeBettingHistory(bets);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/40 border border-purple-500/30 rounded-2xl overflow-hidden backdrop-blur-sm shadow-lg shadow-purple-500/10 min-h-[300px]">
      <div className="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-800/50 to-purple-900/20">
        <div>
          <h3 className="text-xl font-display text-white flex items-center gap-2">
            <BrainCircuit className="text-purple-400" />
            AI Coach <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded ml-2 border border-purple-500/30">Gemini 2.5</span>
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Receba insights profissionais sobre sua performance.
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || bets.length === 0}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
          {loading ? 'Analisando...' : 'Gerar Análise'}
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
            <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full animate-pulse"></div>
                <div className="relative bg-slate-900 p-4 rounded-2xl border border-purple-500/30 shadow-xl shadow-purple-500/20">
                    <Loader2 className="text-purple-400 animate-spin" size={40} />
                </div>
                <div className="absolute -top-2 -right-2 bg-slate-900 p-1.5 rounded-full border border-cyan-500/30">
                    <Sparkles className="text-cyan-400 animate-pulse" size={16} />
                </div>
            </div>
            
            <div className="space-y-2 max-w-sm">
                <h4 className="text-lg font-display text-white animate-pulse">Processando Inteligência</h4>
                <p className="text-sm text-slate-400">
                    A IA está analisando seus padrões de aposta, ROI e consistência para gerar dicas personalizadas...
                </p>
            </div>

            <div className="flex gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
        </div>
      ) : analysis ? (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
            <p className="text-slate-200 leading-relaxed italic border-l-4 border-purple-500 pl-4">
              "{analysis.summary}"
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-emerald-400 font-display text-sm uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={16} /> Pontos Fortes
              </h4>
              <ul className="space-y-2">
                {analysis.strengths.length > 0 ? analysis.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                    {s}
                  </li>
                )) : <li className="text-sm text-slate-500">Nenhum identificado ainda.</li>}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-rose-400 font-display text-sm uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={16} /> Pontos de Atenção
              </h4>
              <ul className="space-y-2">
                {analysis.weaknesses.length > 0 ? analysis.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-slate-300 bg-rose-500/5 p-2 rounded border border-rose-500/10">
                    {w}
                  </li>
                )) : <li className="text-sm text-slate-500">Nenhum identificado ainda.</li>}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-cyan-400 font-display text-sm uppercase tracking-wider flex items-center gap-2">
                <Lightbulb size={16} /> Dicas do Coach
              </h4>
              <ul className="space-y-2">
                {analysis.tips.length > 0 ? analysis.tips.map((t, i) => (
                  <li key={i} className="text-sm text-slate-300 bg-cyan-500/5 p-2 rounded border border-cyan-500/10">
                    {t}
                  </li>
                )) : <li className="text-sm text-slate-500">Nenhuma dica disponível.</li>}
              </ul>
            </div>
          </div>
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-4">
              <BrainCircuit size={48} className="opacity-20" />
              <p>Clique em "Gerar Análise" para receber insights da sua banca.</p>
          </div>
      )}
    </div>
  );
};
