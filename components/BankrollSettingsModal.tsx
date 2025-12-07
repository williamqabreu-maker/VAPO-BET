
import React, { useState, useRef } from 'react';
import { X, Target, Wallet, PieChart, Info, Database, Download, Upload, FileJson, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { BankrollSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface BankrollSettingsModalProps {
  settings: BankrollSettings;
  onSave: (settings: BankrollSettings) => void;
  onClose: () => void;
}

export const BankrollSettingsModal: React.FC<BankrollSettingsModalProps> = ({ settings, onSave, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  const [formData, setFormData] = useState<BankrollSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        startBankroll: Number(formData.startBankroll),
        unitDivisor: Number(formData.unitDivisor),
        profitGoal: Number(formData.profitGoal)
    });
    onClose();
  };

  const calculatedUnitValue = formData.startBankroll && formData.unitDivisor 
    ? formData.startBankroll / formData.unitDivisor 
    : 0;

  // --- BACKUP LOGIC ---
  const handleExportBackup = () => {
    if (!user) return;

    const dataKey = `vapobet_data_${user.id}`;
    const settingsKey = `vapobet_settings_${user.id}`;
    const dreamsKey = `vapobet_dreams_${user.id}`;
    const profileKey = `vapobet_profile_${user.id}`;

    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      user: {
         name: user.name,
         email: user.email,
         id: user.id
      },
      data: {
        bets: JSON.parse(localStorage.getItem(dataKey) || '[]'),
        settings: JSON.parse(localStorage.getItem(settingsKey) || '{}'),
        dreams: JSON.parse(localStorage.getItem(dreamsKey) || '[]'),
        profile: JSON.parse(localStorage.getItem(profileKey) || '{}')
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vapobet_backup_${user.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              
              // Basic Validation
              if (!json.data || !json.timestamp) {
                  throw new Error("Arquivo de backup inválido.");
              }

              const dataKey = `vapobet_data_${user.id}`;
              const settingsKey = `vapobet_settings_${user.id}`;
              const dreamsKey = `vapobet_dreams_${user.id}`;
              const profileKey = `vapobet_profile_${user.id}`;

              // Restore Data
              if (json.data.bets) localStorage.setItem(dataKey, JSON.stringify(json.data.bets));
              if (json.data.settings) localStorage.setItem(settingsKey, JSON.stringify(json.data.settings));
              if (json.data.dreams) localStorage.setItem(dreamsKey, JSON.stringify(json.data.dreams));
              if (json.data.profile) localStorage.setItem(profileKey, JSON.stringify(json.data.profile));

              setImportStatus('success');
              
              // Refresh page after 1.5s to load new data
              setTimeout(() => {
                  window.location.reload();
              }, 1500);

          } catch (err) {
              console.error(err);
              setImportStatus('error');
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-cyan-900/20 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30 rounded-t-2xl shrink-0">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Wallet className="text-cyan-400" /> Configurações
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 shrink-0">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'general' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                Geral
            </button>
            <button 
                onClick={() => setActiveTab('data')}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'data' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                Dados & Backup
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            
            {/* --- TAB: GENERAL --- */}
            {activeTab === 'general' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Start Bankroll */}
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2 font-bold">
                            <Wallet size={14} className="text-emerald-400" /> Banca Inicial (R$)
                        </label>
                        <input 
                            type="number" 
                            required
                            min="1"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none font-mono text-lg"
                            placeholder="Ex: 1000.00"
                            value={formData.startBankroll}
                            onChange={(e) => setFormData({...formData, startBankroll: parseFloat(e.target.value)})}
                        />
                        <p className="text-[10px] text-slate-500 flex gap-1">
                            <Info size={12} /> Valor base para cálculos de ROI e Unidade.
                        </p>
                    </div>

                    {/* Divisor */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2 font-bold">
                            <PieChart size={14} className="text-cyan-400" /> Divisão de Unidades
                        </label>
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <input 
                                    type="number" 
                                    required
                                    min="1"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none font-mono text-lg"
                                    value={formData.unitDivisor}
                                    onChange={(e) => setFormData({...formData, unitDivisor: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 min-w-[120px] text-center">
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Valor da Stake</p>
                                <p className="text-cyan-400 font-bold font-mono text-lg">
                                    R$ {calculatedUnitValue.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 italic">
                            *Dividir por 30 a 50 unidades é ideal para gestão conservadora.
                        </p>
                    </div>

                    {/* Goal */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2 font-bold">
                            <Target size={14} className="text-yellow-400" /> Meta de Lucro (Unidades)
                        </label>
                        <input 
                            type="number" 
                            required
                            min="1"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none font-mono text-lg"
                            placeholder="Ex: 10 Unidades"
                            value={formData.profitGoal}
                            onChange={(e) => setFormData({...formData, profitGoal: parseFloat(e.target.value)})}
                        />
                        <p className="text-[10px] text-slate-500">
                        Meta mensal em unidades. Ex: 10u = R$ {(10 * calculatedUnitValue).toFixed(2)} de lucro.
                        </p>
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all transform hover:scale-[1.02] mt-4"
                    >
                        Salvar Configurações
                    </button>
                </form>
            )}

            {/* --- TAB: DATA --- */}
            {activeTab === 'data' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 shrink-0">
                                <Database size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Backup dos Dados</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Seus dados são salvos no navegador. Recomendamos exportar um backup regularmente para evitar perdas caso limpe o cache.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {/* EXPORT BUTTON */}
                        <button 
                            onClick={handleExportBackup}
                            className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Download size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">Exportar Backup</p>
                                    <p className="text-[10px] text-slate-500">Baixar arquivo .JSON</p>
                                </div>
                            </div>
                            <div className="bg-slate-900 px-2 py-1 rounded text-[10px] font-mono text-slate-500">.json</div>
                        </button>

                        {/* IMPORT BUTTON */}
                        <div className="relative">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleImportBackup}
                                className="hidden"
                                accept=".json"
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                        <Upload size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-white">Restaurar Dados</p>
                                        <p className="text-[10px] text-slate-500">Carregar arquivo .JSON</p>
                                    </div>
                                </div>
                                <div className="bg-slate-900 px-2 py-1 rounded text-[10px] font-mono text-slate-500">.json</div>
                            </button>
                        </div>
                    </div>

                    {/* STATUS MESSAGES */}
                    {importStatus === 'success' && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold animate-pulse">
                            <CheckCircle2 size={16} /> Backup restaurado! Recarregando...
                        </div>
                    )}
                    {importStatus === 'error' && (
                        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-bold animate-shake">
                            <AlertTriangle size={16} /> Erro ao ler arquivo. Verifique o formato.
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-800">
                         <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                             <FileJson size={10} /> O arquivo contém apostas, configs e perfil.
                         </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
