import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  highlight?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, trend, icon, highlight }) => {
  return (
    <div className={`
      relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10
      ${highlight 
        ? 'bg-gradient-to-br from-cyan-900/40 to-slate-900 border-cyan-500/50 shadow-cyan-500/20' 
        : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'}
    `}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-display uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-2xl font-bold font-display ${highlight ? 'text-cyan-400' : 'text-slate-100'}`}>
            {value}
          </h3>
          {subtitle && (
            <p className={`text-xs mt-2 font-medium ${
              trend === 'up' ? 'text-emerald-400' : 
              trend === 'down' ? 'text-rose-400' : 'text-slate-500'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${highlight ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700/50 text-slate-400'}`}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Decorative futuristic lines */}
      {highlight && (
        <>
          <div className="absolute top-0 right-0 w-16 h-[1px] bg-gradient-to-l from-cyan-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-16 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent"></div>
        </>
      )}
    </div>
  );
};