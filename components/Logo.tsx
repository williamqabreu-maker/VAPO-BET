
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan 500 */}
          <stop offset="50%" stopColor="#3b82f6" /> {/* Blue 500 */}
          <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet 500 */}
        </linearGradient>
        
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Tech Ring Background */}
      <circle cx="50" cy="50" r="48" stroke="url(#logoGradient)" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="10 5" className="animate-[spin_10s_linear_infinite]" />
      
      {/* Hexagon Shape (Structure/Stability) */}
      <path 
        d="M50 5 L93.3 30 V80 L50 105 L6.7 80 V30 L50 5Z" 
        stroke="url(#logoGradient)" 
        strokeWidth="2" 
        fill="rgba(6, 182, 212, 0.1)"
        filter="url(#neonGlow)"
        transform="scale(0.85) translate(8.5, 5)"
      />

      {/* The "V" / Uptrend Graph (Prosperity) */}
      <path 
        d="M30 40 L50 70 L75 30" 
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#neonGlow)"
      />
      
      {/* Coin/Target Dot (Betting) */}
      <circle cx="75" cy="30" r="4" fill="#fbbf24" filter="url(#neonGlow)">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Data Lines */}
      <path d="M20 50 L30 50" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
      <path d="M70 50 L80 50" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
    </svg>
  );
};
