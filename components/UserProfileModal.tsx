
import React, { useState, useRef } from 'react';
import { X, User, Save, Camera, UploadCloud } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ profile, onSave, onClose }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Max 3MB
    if (file.size > 3 * 1024 * 1024) {
      alert("Imagem muito grande! O limite é 3MB para salvar no navegador.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <User className="text-cyan-400" /> Meu Perfil
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center mb-2">
            <div 
                className="relative w-28 h-28 rounded-full border-4 border-slate-800 shadow-xl overflow-hidden bg-slate-900 group cursor-pointer transition-transform hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
            >
               {formData.avatarUrl ? (
                   <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                   <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                       <User size={40} />
                   </div>
               )}
               
               {/* Overlay */}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                   <Camera size={24} className="text-white mb-1" />
                   <span className="text-[10px] text-white font-bold uppercase">Alterar</span>
               </div>

               <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleFileUpload}
                   className="hidden"
                   accept="image/*"
               />
            </div>
            <p className="text-xs text-slate-500 mt-3">Toque na imagem para fazer upload</p>
          </div>

          <div className="space-y-2">
             <label className="text-xs text-slate-400 uppercase tracking-wide">Nickname</label>
             <input 
                type="text" 
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Ex: VapoMaster"
             />
          </div>

          <div className="space-y-2">
             <label className="text-xs text-slate-400 uppercase tracking-wide">Avatar (URL ou Upload)</label>
             <div className="flex gap-2">
                 <input 
                    type="url" 
                    value={formData.avatarUrl || ''}
                    onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none text-sm truncate"
                    placeholder="https://..."
                 />
                 <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 rounded-lg border border-slate-700 transition-colors"
                    title="Carregar do dispositivo"
                 >
                     <UploadCloud size={20} />
                 </button>
             </div>
             <p className="text-[10px] text-slate-500">Cole um link ou use o botão para carregar do seu celular.</p>
          </div>

          <button 
             type="submit"
             className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
          >
             <Save size={18} /> Salvar Perfil
          </button>
        </form>
      </div>
    </div>
  );
};
