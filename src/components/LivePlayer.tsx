
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Wifi, WifiOff, AlertCircle, Settings, Lock, Signal } from 'lucide-react';
import { User } from '../types';

interface LivePlayerProps {
  user: User | null;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({ user }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl] = useState(''); // Current playing URL
  const [inputUrl, setInputUrl] = useState(''); // Admin input
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const isAdmin = user?.role === 'admin';
  const STORAGE_KEY = 'vapobet_official_stream';

  // Load saved stream on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEY);
    if (savedUrl) {
      setStreamUrl(savedUrl);
      if (isAdmin) setInputUrl(savedUrl);
    }

    // Polling to check if stream changed (Simulating socket for users)
    const interval = setInterval(() => {
        const currentSaved = localStorage.getItem(STORAGE_KEY);
        if (currentSaved && currentSaved !== streamUrl) {
            setStreamUrl(currentSaved);
        }
    }, 5000);

    return () => clearInterval(interval);
  }, [streamUrl, isAdmin]);

  // Handle Stream Playback
  useEffect(() => {
    if (!streamUrl) return;

    const loadStream = () => {
        setError(null);
        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            if (hlsRef.current) hlsRef.current.destroy();
            
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsRef.current = hls;
            
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => setIsPlaying(false));
                setIsPlaying(true);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    setError("Sinal instável ou offline.");
                    setIsPlaying(false);
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play();
                setIsPlaying(true);
            });
        }
    };

    loadStream();

    return () => {
        if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [streamUrl]);

  const handleSaveStream = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, inputUrl);
    setStreamUrl(inputUrl);
    alert("Transmissão atualizada para todos os usuários!");
  };

  const handleClearStream = () => {
      localStorage.removeItem(STORAGE_KEY);
      setStreamUrl('');
      setInputUrl('');
  };

  if (!streamUrl && !isAdmin) return null;

  return (
    <div className="animate-fade-in mb-8">
      <div className="bg-black rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative group">
        
        {/* Admin Controls Overlay (Visible on Hover/Always if no stream) */}
        {isAdmin && (
            <div className={`absolute top-0 left-0 right-0 z-20 p-4 bg-slate-900/90 border-b border-slate-700 transition-transform duration-300 ${streamUrl ? '-translate-y-full group-hover:translate-y-0' : 'translate-y-0'}`}>
                <form onSubmit={handleSaveStream} className="flex items-center gap-2">
                    <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                        <Lock size={16} />
                    </div>
                    <input 
                        type="text" 
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Link M3U8 (Área Restrita do Tipster)"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none font-mono"
                    />
                    <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">
                        Transmitir
                    </button>
                    {streamUrl && (
                        <button type="button" onClick={handleClearStream} className="text-slate-400 hover:text-white px-2">
                            Parar
                        </button>
                    )}
                </form>
            </div>
        )}

        {/* Video Player */}
        <div className="relative aspect-video bg-slate-950">
            {streamUrl ? (
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                    muted={false} 
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50">
                    <Signal size={48} className="mb-2 opacity-50" />
                    <p className="font-display tracking-widest uppercase text-sm">Transmissão Encerrada</p>
                </div>
            )}

            {/* Status Overlay */}
            {streamUrl && !isPlaying && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                    <AlertCircle size={32} className="text-rose-500 mb-2" />
                    <p className="text-rose-400 font-bold text-sm">{error}</p>
                </div>
            )}

            {/* LIVE Badge */}
            {isPlaying && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-pulse flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div> AO VIVO
                    </span>
                    {isAdmin && <span className="bg-slate-900/80 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">Visão do Admin</span>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
