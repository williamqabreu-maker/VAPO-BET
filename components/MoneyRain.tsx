
import React, { useEffect, useState } from 'react';

export const MoneyRain: React.FC = () => {
  const [items, setItems] = useState<Array<{ id: number; left: number; duration: number; delay: number; icon: string; size: number; rot: number }>>([]);

  useEffect(() => {
    const icons = ['💸', '💰', '💵', '🤑', '💎', '🟢', '🚀'];
    const newItems = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position
      duration: Math.random() * 2 + 3, // Random duration between 3s and 5s
      delay: Math.random() * 2, // Random delay
      icon: icons[Math.floor(Math.random() * icons.length)],
      size: Math.random() * 2 + 1.5, // Random size scale
      rot: Math.random() * 360 // Initial rotation
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg) scale(var(--scale)); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg) scale(var(--scale)); opacity: 0; }
        }
      `}</style>
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute top-0"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}rem`,
            animation: `fall ${item.duration}s linear ${item.delay}s infinite`,
            ['--scale' as any]: Math.random() * 0.5 + 0.8, // CSS variable for scale
            textShadow: '0 0 10px rgba(0,255,0,0.3)'
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
};
