
import React, { useState, useEffect } from 'react';
import { Briefcase, Coins, Wallet, Ghost, Sparkles } from 'lucide-react';

interface VapoBotProps {
  profit: number;
}

export const VapoBot: React.FC<VapoBotProps> = ({ profit }) => {
  const [imgError, setImgError] = useState(false);

  const getState = () => {
    if (profit < 0) return 'loss';
    if (profit === 0) return 'neutral';
    if (profit > 0 && profit < 20) return 'profit';
    return 'rich'; 
  };

  const state = getState();
  
  // Colors based on state
  const isLoss = state === 'loss';
  const primaryColor = isLoss ? '#f43f5e' : '#10b981'; // Rose vs Emerald

  const getAvatarUrl = () => {
    const apiBase = "https://api.dicebear.com/9.x/avataaars/svg";
    
    // Base Identity: Black Hair, Tan Skin, Green Polo - STRICT CONSISTENCY
    let params = [
      "seed=VapoBossFinalv3",
      "radius=0",
      "backgroundColor=transparent",
      "top=shortHairShortFlat",
      "hairColor=000000",
      "skinColor=edb98a",
      "clotheType=collarSweater",
      "clotheColor=15803d",
      "facialHairProbability=0",
      "graphicType=hola", 
    ];

    switch (state) {
      case 'loss':
        params.push("mouth=sad", "eyebrows=sad", "eyes=cry", "accessoriesProbability=0");
        break;
      case 'neutral':
        params.push("mouth=smile", "eyebrows=default", "eyes=default", "accessories=sunglasses", "accessoriesOpacity=100", "accessoriesColor=000000");
        break;
      case 'profit':
        params.push("mouth=smile", "eyebrows=default", "eyes=default", "accessories=sunglasses", "accessoriesOpacity=100", "accessoriesColor=000000");
        break;
      case 'rich':
        // High energy look
        params.push("mouth=smile", "eyebrows=raisedExcited", "eyes=default", "accessories=sunglasses", "accessoriesOpacity=100", "accessoriesColor=000000");
        break;
    }
    
    return `${apiBase}?${params.join('&')}`;
  };

  // --- Dynamic Physics Calculation based on Profit Magnitude ---
  const calculatePhysics = () => {
    if (state !== 'rich') return { particleCount: 0, speed: 0, scale: 1, auraDuration: '2s' };
    
    // Magnitude limits
    const safeProfit = Math.min(Math.max(profit, 20), 500);
    // Particle count scales with profit
    const particleCount = Math.floor(30 + (safeProfit * 0.15));
    // Speed multiplier scales with profit
    const speed = 1 + (safeProfit * 0.003);
    // Aura pulse speed gets faster with higher profit
    const auraDurationMs = Math.max(500, 2000 - (safeProfit * 3));
    const auraDuration = `${auraDurationMs}ms`;

    return { particleCount: Math.min(particleCount, 80), speed, scale: 1, auraDuration };
  };

  const { particleCount, speed, auraDuration } = calculatePhysics();

  return (
    <div className={`
      relative h-full min-h-[280px] rounded-3xl border overflow-hidden flex flex-col items-center justify-center select-none group
      ${isLoss 
        ? 'bg-[#0f1014] border-rose-900/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
        : 'bg-[#0B0D12] border-emerald-900/30 shadow-2xl'} 
    `}>
      <style>{`
        @keyframes float-avatar {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes money-rain {
          0% { transform: translateY(-50px) rotate3d(1, 1, 1, 0deg) scale(0.8); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(350px) rotate3d(var(--rx), var(--ry), var(--rz), 720deg) scale(1.2); opacity: 0; }
        }
        @keyframes grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 30px 30px; }
        }
        @keyframes aura-pulse {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.15); opacity: 0.6; }
            100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
      
      {/* 1. Background Grid & Chart */}
      <div className="absolute inset-0 z-0 opacity-[0.05] animate-[grid-move_20s_linear_infinite]" 
           style={{ 
               backgroundImage: `
                linear-gradient(to right, ${isLoss ? '#be123c' : '#10b981'} 1px, transparent 1px),
                linear-gradient(to bottom, ${isLoss ? '#be123c' : '#10b981'} 1px, transparent 1px)
               `,
               backgroundSize: '40px 40px' 
           }}
      />
      
      {/* Background Chart Line Decoration */}
      <svg className="absolute top-10 left-0 right-0 w-full h-32 opacity-20 pointer-events-none" preserveAspectRatio="none">
         <path 
            d={`M0 60 Q 50 ${isLoss ? 80 : 40}, 100 ${isLoss ? 90 : 30} T 200 ${isLoss ? 100 : 20} T 300 40`}
            fill="none"
            stroke={primaryColor}
            strokeWidth="2"
         />
      </svg>

      {/* 2. Rich State Particles (Background) */}
      {state === 'rich' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(particleCount)].map((_, i) => {
            const isGold = Math.random() > 0.5;
            const rx = Math.random();
            const ry = Math.random();
            const rz = Math.random();
            return (
              <div 
                key={i} 
                className={`absolute font-bold opacity-0 ${isGold ? 'text-yellow-400' : 'text-emerald-500'}`} 
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    animation: `money-rain ${(Math.random() * 2 + 2) / speed}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    fontSize: `${Math.random() * 16 + 12}px`,
                    ['--rx' as any]: rx, ['--ry' as any]: ry, ['--rz' as any]: rz,
                }}
              >
                {isGold ? '$$$' : '¥'}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Central HUD / Avatar Circle */}
      <div className="relative z-10 flex flex-col items-center">
          
          {/* God Mode Aura (Rich State Only) */}
          {state === 'rich' && (
             <div 
                className="absolute inset-0 bg-yellow-500/20 rounded-full blur-2xl -z-10"
                style={{ animation: `aura-pulse ${auraDuration} ease-in-out infinite` }}
             ></div>
          )}

          {/* Main Circle Container */}
          <div className={`w-44 h-44 rounded-full border-[6px] ${isLoss ? 'border-[#1e293b] bg-rose-950/20' : 'border-[#1e293b] bg-[#161b22]'} flex items-center justify-center relative shadow-2xl z-20`}>
             
             {/* Spinning Dashed Ring */}
             <div className={`absolute inset-[-12px] rounded-full border-[2px] border-dashed opacity-30 animate-[spin_20s_linear_infinite] ${isLoss ? 'border-rose-500' : state === 'rich' ? 'border-yellow-400' : 'border-emerald-500'}`}></div>
             
             {/* Thin Inner Ring */}
             <div className={`absolute inset-2 rounded-full border opacity-50 ${isLoss ? 'border-rose-500' : state === 'rich' ? 'border-yellow-400/50' : 'border-emerald-500/30'}`}></div>

             {/* Avatar Image */}
             <div className="w-32 h-32 relative z-20 animate-[float-avatar_4s_ease-in-out_infinite]">
                 {imgError ? (
                     <div className="w-full h-full flex items-center justify-center text-4xl">{isLoss ? '😭' : '😎'}</div>
                 ) : (
                     <img src={getAvatarUrl()} alt="Avatar" className="w-full h-full object-contain filter drop-shadow-lg" onError={() => setImgError(true)} />
                 )}
             </div>

             {/* --- Satellite Icons (Centered on Border) --- */}
             
             {/* Left: Briefcase */}
             <div className={`absolute bottom-5 -left-4 w-12 h-12 rounded-full flex items-center justify-center border-[4px] border-[#0B0D12] shadow-lg z-30 transition-colors duration-500
                 ${isLoss ? 'bg-rose-900 text-rose-200' : state === 'rich' ? 'bg-yellow-600 text-yellow-100' : 'bg-[#355e3b] text-emerald-100'}`}>
                {state === 'rich' ? <Sparkles size={20} className="animate-pulse" /> : isLoss ? <Wallet size={20} /> : <Briefcase size={20} />}
             </div>

             {/* Right: Coins */}
             <div className={`absolute bottom-5 -right-4 w-12 h-12 rounded-full flex items-center justify-center border-[4px] border-[#0B0D12] shadow-lg z-30 transition-colors duration-500
                 ${isLoss ? 'bg-slate-700 text-slate-400' : state === 'rich' ? 'bg-[#ca8a04] text-white' : 'bg-[#ca8a04] text-yellow-100'}`}>
                 {isLoss ? <Ghost size={20} /> : <Coins size={20} />}
             </div>
          </div>
      </div>

    </div>
  );
};
