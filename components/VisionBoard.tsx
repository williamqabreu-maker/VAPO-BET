
import React, { useState, useRef } from 'react';
import { DreamItem } from '../types';
import { Plus, X, Image as ImageIcon, Video, Trash2, Rocket, Sparkles, UploadCloud, Link as LinkIcon, FileWarning } from 'lucide-react';

interface VisionBoardProps {
  items: DreamItem[];
  onAdd: (item: Omit<DreamItem, 'id' | 'dateAdded'>) => void;
  onRemove: (id: string) => void;
}

export const VisionBoard: React.FC<VisionBoardProps> = ({ items, onAdd, onRemove }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'upload'>('link');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    type: 'image' as 'image' | 'video',
    url: '',
    title: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.url && formData.title) {
      onAdd(formData);
      setFormData({ type: 'image', url: '', title: '' });
      setIsAdding(false);
      setActiveTab('link');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Max 3MB
    if (file.size > 3 * 1024 * 1024) {
      alert("Arquivo muito grande! O limite para upload local é 3MB. Para arquivos maiores, use um Link Externo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        url: reader.result as string,
        // Auto-detect type based on mime
        type: file.type.startsWith('video') ? 'video' : 'image'
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-slate-800/40 p-6 rounded-2xl border border-purple-500/20 relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Rocket className="text-purple-400" /> Quadro dos Sonhos
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-lg">
            Visualize suas metas. Materialize seus ganhos. Adicione fotos e vídeos daquilo que você vai conquistar com as apostas.
          </p>
        </div>
        
        <button
          onClick={() => setIsAdding(true)}
          className="relative z-10 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 transform hover:scale-105"
        >
          <Plus size={20} />
          Adicionar Sonho
        </button>
      </div>

      {/* Grid Display */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Sparkles size={32} className="text-slate-600" />
          </div>
          <h3 className="text-slate-300 font-display text-lg mb-2">Seu quadro está vazio</h3>
          <p className="text-slate-500 text-sm max-w-xs">
            Comece adicionando imagens do carro, casa ou viagem que você deseja.
          </p>
          <button 
             onClick={() => setIsAdding(true)}
             className="mt-6 text-purple-400 hover:text-purple-300 text-sm font-bold uppercase tracking-wider"
          >
             Começar agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
                key={item.id} 
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
            >
              {/* Media Content */}
              <div className="aspect-video w-full bg-black relative">
                {item.type === 'video' ? (
                  <video 
                    src={item.url} 
                    controls 
                    className="w-full h-full object-cover"
                    poster="https://via.placeholder.com/640x360?text=Video+Preview"
                  />
                ) : (
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Imagem+Quebrada';
                    }}
                  />
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
              </div>

              {/* Info & Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                 <h4 className="text-white font-display font-bold text-lg drop-shadow-md truncate">
                    {item.title}
                 </h4>
                 <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-slate-400 bg-slate-950/50 px-2 py-1 rounded border border-slate-800 uppercase tracking-wide">
                        {item.type === 'video' ? 'Vídeo' : 'Imagem'}
                    </span>
                    <button 
                        onClick={() => onRemove(item.id)}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-colors backdrop-blur-sm border border-rose-500/30"
                        title="Realizado / Remover"
                    >
                        <Trash2 size={16} />
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-900/20 animate-fade-in-up">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
              <h3 className="text-white font-display font-bold">Adicionar ao Quadro</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                    type="button"
                    onClick={() => setActiveTab('link')}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'link' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <LinkIcon size={14} /> Link Externo
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'upload' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <UploadCloud size={14} /> Upload Arquivo
                </button>
              </div>

              {/* Media Type Selector (Only relevant for Link mode mostly, but kept for clarity) */}
              {activeTab === 'link' && (
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'image'})}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            formData.type === 'image' 
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300' 
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                        <ImageIcon size={24} />
                        <span className="text-xs font-bold uppercase">Imagem</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'video'})}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            formData.type === 'video' 
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300' 
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                        <Video size={24} />
                        <span className="text-xs font-bold uppercase">Vídeo Curto</span>
                    </button>
                </div>
              )}

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wide">Título / Meta</label>
                    <input 
                        type="text" 
                        required
                        placeholder="Ex: BMW 320i 2024"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                </div>

                {activeTab === 'link' ? (
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wide">URL da Mídia</label>
                        <input 
                            type="url" 
                            required={activeTab === 'link'}
                            placeholder={formData.type === 'image' ? "https://site.com/foto.jpg" : "https://site.com/video.mp4"}
                            value={formData.url}
                            onChange={(e) => setFormData({...formData, url: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none text-sm font-mono"
                        />
                        <p className="text-[10px] text-slate-500">
                            *Cole o link direto da imagem ou vídeo.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wide">Upload do Dispositivo</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-slate-700 hover:border-purple-500 hover:bg-slate-800/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="image/*,video/mp4,video/webm"
                            />
                            {formData.url ? (
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-400">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="text-xs text-emerald-400 font-bold">Arquivo Carregado!</p>
                                    <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[200px] mx-auto">Pronto para salvar</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <UploadCloud size={32} className="text-slate-500 group-hover:text-purple-400 mb-2 mx-auto transition-colors" />
                                    <p className="text-sm text-slate-300 font-medium">Clique para escolher</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Imagens ou Vídeos Curtos (Max 3MB)</p>
                                </div>
                            )}
                        </div>
                        {formData.url && activeTab === 'upload' && (
                             <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 justify-center">
                                <FileWarning size={10} /> Arquivos grandes podem deixar o app lento.
                             </p>
                        )}
                    </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={!formData.url}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20 mt-2"
              >
                Adicionar ao Mural
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
