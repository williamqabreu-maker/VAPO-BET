import React, { useEffect } from 'react';
import { CheckCircle2, Send, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-4 z-[100] animate-fade-in-left">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg shadow-cyan-500/10
        ${type === 'success' 
          ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-50' 
          : 'bg-slate-900/90 border-purple-500/50 text-purple-50'}
      `}>
        <div className={`
          p-1.5 rounded-full 
          ${type === 'success' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}
        `}>
          {type === 'success' ? <CheckCircle2 size={18} /> : <Send size={18} />}
        </div>
        
        <div className="mr-2">
          <h4 className="text-sm font-semibold font-display">VAPOBET System</h4>
          <p className="text-xs text-slate-300">{message}</p>
        </div>

        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};