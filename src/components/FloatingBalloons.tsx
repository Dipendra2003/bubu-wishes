import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { FloatingEffectType } from '../types';

const BALLOON_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const ICONS = {
  hearts: ['❤️', '💕', '💖', '💗', '💓', '💝'],
  snow: ['❄️', '🧊', '☁️', '❄️'],
  stars: ['⭐', '🌟', '✨', '🌠', '💫'],
  pizza: ['🍕', '🍕', '🍕', '🍅', '🧀']
}

export function FloatingBalloons({ isActive, effectType = 'balloons' }: { isActive: boolean; effectType?: FloatingEffectType }) {
  const [items, setItems] = useState<{ id: number; color: string; left: number; duration: number; xDrift: number; icon?: string }[]>([]);

  useEffect(() => {
    if (!isActive || effectType === 'none') return;
    
    // Initial spawn
    setItems(Array.from({ length: 3 }).map((_, i) => ({
      id: Date.now() + i,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      icon: effectType !== 'balloons' ? ICONS[effectType as keyof typeof ICONS][Math.floor(Math.random() * ICONS[effectType as keyof typeof ICONS].length)] : undefined,
      left: 10 + Math.random() * 70,
      duration: effectType === 'pizza' ? 8 + Math.random() * 4 : 6 + Math.random() * 6,
      xDrift: (Math.random() - 0.5) * 50
    })));

    const interval = setInterval(() => {
      setItems(prev => {
        if (prev.length > 8) return prev; // Max items
        return [
          ...prev,
          {
            id: Date.now(),
            color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
            icon: effectType !== 'balloons' ? ICONS[effectType as keyof typeof ICONS][Math.floor(Math.random() * ICONS[effectType as keyof typeof ICONS].length)] : undefined,
            left: 10 + Math.random() * 70,
            duration: effectType === 'pizza' ? 8 + Math.random() * 4 : 6 + Math.random() * 6,
            xDrift: (Math.random() - 0.5) * 50
          }
        ];
      });
    }, effectType === 'snow' ? 1500 : 2500);
    
    return () => clearInterval(interval);
  }, [isActive, effectType]);

  const popItem = (e: React.MouseEvent, id: number, color: string, icon?: string) => {
    e.stopPropagation();
    
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: icon ? undefined : [color, '#ffffff', '#fde047'],
      ticks: 150,
      gravity: 0.8,
      scalar: 0.8,
      zIndex: 100
    });

    setItems(prev => prev.filter(b => b.id !== id));
  };

  if (!isActive || effectType === 'none') return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl z-0">
      <AnimatePresence>
        {items.map(b => {
          const isFalling = effectType === 'snow' || effectType === 'pizza';
          return (
            <motion.div
              key={b.id}
              initial={{ y: isFalling ? -100 : 0, x: 0, opacity: 0, scale: 0.8 }}
              animate={{ y: isFalling ? 600 : -600, x: b.xDrift, opacity: 1, scale: 1, rotate: isFalling ? (b.xDrift > 0 ? 180 : -180) : 0 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: b.duration, ease: 'linear' }}
              onAnimationComplete={() => setItems(prev => prev.filter(item => item.id !== b.id))}
              style={{ left: `${b.left}%`, top: isFalling ? '0%' : '100%', position: 'absolute' }}
              className="pointer-events-auto cursor-crosshair drop-shadow-md hover:drop-shadow-xl transition-shadow"
              onClick={(e) => popItem(e, b.id, b.color, b.icon)}
            >
              {effectType === 'balloons' ? (
                <svg width="40" height="60" viewBox="0 0 40 60" className="overflow-visible">
                  <path d="M20,0 C8,0 0,10 0,22 C0,35 15,45 20,48 C25,45 40,35 40,22 C40,10 32,0 20,0 Z" fill={b.color} />
                  <path d="M20,48 L18,52 L22,52 Z" fill={b.color} />
                  <path d="M20,52 Q15,57 20,62 T20,70" fill="transparent" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
                  <ellipse cx="12" cy="12" rx="4" ry="8" fill="white" opacity="0.4" transform="rotate(-30 12 12)" />
                </svg>
              ) : (
                <span className="text-4xl filter drop-shadow-lg leading-none select-none inline-block">
                  {b.icon}
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}