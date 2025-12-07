
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, AlertCircle, Lock, Signal, Tv, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface LivePlayerProps {
  user: User | null;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({ user }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const isAdmin = user?.role === 'admin';
  const STORAGE_KEY = 'vapobet_official_stream';

  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEY);
    if (savedUrl) {
      setStreamUrl(savedUrl);
      if (isAdmin) setInputUrl(savedUrl);
    }

    // Polling to sync stream URL across users/tabs
    const interval = setInterval(() => {
        const currentSaved = localStorage.getItem(STORAGE_KEY);
        if (currentSaved && currentSaved !== streamUrl) {
            setStreamUrl(currentSaved);
        } else if (!currentSaved && streamUrl) {
            setStreamUrl('');
        }
    }, 3000);

    return () => clearInterval(interval);
  }, [streamUrl, isAdmin]);

  useEffect(() => {
    if (!streamUrl) {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        return;
    }

    const loadStream = () => {
        setError(null);
        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            if (hlsRef.current) hlsRef.current.destroy();
            
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hlsRef.current = hls;
            
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => setIsPlaying(false));
                setIsPlaying(true);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('Media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('Fatal error', data);
                            setError("Erro fatal na transmissão.");
                            hls.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => setIsPlaying(false));
                setIsPlaying(true);
            });
            video.addEventListener('error', () => setError("Erro ao carregar stream nativo."));
        } else {
            setError("Seu navegador não suporta reprodução HLS.");
        }
    };

    loadStream();

    return () => {
        if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [streamUrl]);

  const handleSaveStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
        localStorage.setItem(STORAGE_KEY, inputUrl);
        setStreamUrl(inputUrl);
        setError(null);
    }
  };

  const handleClearStream = () => {
      localStorage.removeItem(STORAGE_KEY);
      setStreamUrl('');
      setInputUrl('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 animate-fade-in">
       {isAdmin && (
           <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 mb-4 shadow-lg">
               <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold uppercase tracking-wider text-xs">
                   <Lock size={12} /> Painel do Tipster (Stream)
               </div>
               <form onSubmit={handleSaveStream} className="flex gap-2">
                  <input 
                      type="text" 
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="Cole a URL .m3u8 aqui..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none placeholder:text-slate-600 transition-all"
                  />
                  <button 
                    type="submit" 
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-lg text-xs uppercase transition-colors shadow-lg shadow-cyan-900/20"
                  >
                    Transmitir
                  </button>
                  {streamUrl && (
                    <button 
                        type="button" 
                        onClick={handleClearStream} 
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold px-4 py-2 rounded-lg text-xs uppercase transition-colors"
                    >
                        Parar
                    </button>
                  )}
               </form>
           </div>
       )}

       <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group ring-1 ring-white/5">
          {streamUrl ? (
             <div className="relative w-full h-full bg-black">
                 <video 
                    ref={videoRef} 
                    className="w-full h-full object-contain" 
                    controls 
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                 />
                 
                 {/* Live Badge */}
                 {isPlaying && (
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
                        <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1.5 animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full"></div> AO VIVO
                        </div>
                    </div>
                 )}
                 
                 {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30">
                        <AlertCircle size={40} className="text-rose-500 mb-4" />
                        <p className="text-rose-400 font-bold mb-4 text-center px-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition-colors"
                        >
                            <RefreshCw size={16} /> Recarregar
                        </button>
                    </div>
                 )}
             </div>
          ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050608] text-slate-500">
                <div className="w-full h-full absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="relative z-10 flex flex-col items-center animate-pulse">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border-2 border-slate-800 shadow-2xl">
                        <Tv size={32} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-300 tracking-tight">TRANSMISSÃO OFFLINE</h3>
                    <p className="text-xs font-medium text-slate-600 mt-2 uppercase tracking-widest">Aguardando sinal...</p>
                </div>
                
                <div className="absolute bottom-8 flex gap-8 opacity-20">
                     <div className="flex items-center gap-2 text-[10px] uppercase font-mono"><Signal size={12} /> No Signal</div>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};
