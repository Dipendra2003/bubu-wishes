import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Gift, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { ThemeType } from '../types';

interface UnwrapBoxProps {
  onUnwrapped: () => void;
  theme: ThemeType;
}

export function UnwrapBox({ onUnwrapped, theme }: UnwrapBoxProps) {
  const [taps, setTaps] = useState(0);
  const [isTearing, setIsTearing] = useState(false);
  const [pieces, setPieces] = useState<{ id: number; x: number; y: number; rot1: number; rot2: number }[]>([]);
  const requiredTaps = 7; // More taps for more fun

  const handleTap = () => {
    if (taps >= requiredTaps) return;
    
    setTaps(prev => prev + 1);
    setIsTearing(true);

    // Add torn pieces flying off
    const newPieces = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 400 * (taps * 0.5 + 1),
      y: (Math.random() - 0.5) * 400 * (taps * 0.5 + 1) - 100,
      rot1: Math.random() * 90,
      rot2: Math.random() * 360 - 180,
    }));
    setPieces(prev => [...prev.slice(-15), ...newPieces]); // keep last 20 pieces to avoid memory bloat
    
    // Feedback confetti
    confetti({
      particleCount: 15 + taps * 5,
      spread: 60 + taps * 10,
      origin: { y: 0.6, x: 0.5 },
      colors: theme === 'party' ? ['#ff0a54', '#ff477e', '#ff7096', '#fcd5ce'] : 
              theme === 'love' ? ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1'] : 
              ['#4cc9f0', '#48cae4', '#90e0ef', '#caf0f8']
    });

    setTimeout(() => setIsTearing(false), 150);
  };

  useEffect(() => {
    if (taps >= requiredTaps) {
      // Massive explosion
      const duration = 2500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 10,
          angle: 60,
          spread: 80,
          origin: { x: 0 },
          colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#f9bc60', '#8ac926', '#1982c4']
        });
        confetti({
          particleCount: 10,
          angle: 120,
          spread: 80,
          origin: { x: 1 },
          colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#f9bc60', '#8ac926', '#1982c4']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else {
           // Final burst before transition
           confetti({
             particleCount: 150,
             spread: 120,
             origin: { y: 0.5 },
             colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#f9bc60']
           });
        }
      };
      
      frame();

      setTimeout(() => {
        onUnwrapped();
      }, 1200);
    }
  }, [taps, onUnwrapped]);

  const tapProgress = taps / requiredTaps;
  
  const messages = [
    "Tap to unwrap!",
    "Keep going!",
    "Tear it open!",
    "It's opening!",
    "Almost there!",
    "One big push!",
    "Just a bit more!"
  ];
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-md z-50 overflow-hidden" onClick={handleTap}>
      <AnimatePresence>
        {taps < requiredTaps && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1 + tapProgress * 0.15, 
              opacity: 1,
              rotate: isTearing ? [0, -8 - taps, 8 + taps, -8 - taps, 8 + taps, 0] : 0,
              y: isTearing ? [-2 - taps, 2 + taps, -2 - taps, 2 + taps, 0] : 0,
              filter: isTearing ? `hue-rotate(${taps * 10}deg)` : 'none'
            }}
            whileTap={{ scale: 0.95 + tapProgress * 0.1 }}
            exit={{ scale: 2.5, opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.3 }}
            className="cursor-pointer relative flex flex-col items-center justify-center"
          >
            <div className="relative">
              {/* The Gift Box */}
              <div 
                className={cn(
                  "w-64 h-64 sm:w-80 sm:h-80 rounded-[2rem] shadow-2xl relative overflow-hidden transition-all duration-300",
                  theme === 'love' ? "bg-red-500 shadow-red-500/40" :
                  theme === 'party' ? "bg-amber-500 shadow-amber-500/40" :
                  "bg-indigo-500 shadow-indigo-500/40",
                  isTearing && "brightness-110"
                )}
                style={{
                  clipPath: tapProgress > 0 ? `polygon(
                    ${tapProgress * 8}% ${tapProgress * 2}%, 
                    ${100 - tapProgress * 5}% 0%,
                    100% ${100 - tapProgress * 8}%,
                    ${100 - tapProgress * 15}% 100%,
                    ${tapProgress * 5}% ${100 - tapProgress * 3}%,
                     0% ${50 + tapProgress * 10}%
                  )` : 'none'
                }}
              >
                {/* Wrapping paper pattern */}
                <div 
                   className="absolute inset-0 opacity-20 mix-blend-overlay"
                   style={{
                     backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 15px, white 15px, white 30px)`
                   }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/20" />

                {/* Ribbon horizontal */}
                <div className="absolute left-0 right-0 h-16 bg-white/40 top-1/2 -translate-y-1/2 shadow-lg backdrop-blur-sm border-y border-white/50" />
                {/* Ribbon vertical */}
                <div className="absolute top-0 bottom-0 w-16 bg-white/40 left-1/2 -translate-x-1/2 shadow-lg backdrop-blur-sm border-x border-white/50" />
                
                <Gift className="w-28 h-28 text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />

                {/* Simulated tears on the box */}
                {tapProgress > 0 && Array.from({ length: taps * 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-white/30 backdrop-blur-sm shadow-inner"
                    style={{
                      width: Math.random() * 80 + 20 + 'px',
                      height: Math.random() * 8 + 4 + 'px',
                      top: Math.random() * 100 + '%',
                      left: Math.random() * 100 + '%',
                      rotate: Math.random() * 360 + 'deg',
                      borderRadius: '8px',
                    }}
                  />
                ))}
              </div>

              {/* Top Bow Glow */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-white/30 rounded-full blur-2xl z-0" />
              
              {/* Flying pieces particle effect */}
              <AnimatePresence>
                {pieces.map((piece) => (
                  <motion.div
                    key={piece.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: piece.rot1 }}
                    animate={{ x: piece.x, y: piece.y, opacity: 0, scale: 0.2, rotate: piece.rot2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8 z-20 pointer-events-none rounded-lg shadow-sm border border-white/20",
                      theme === 'love' ? "bg-red-400" : theme === 'party' ? "bg-amber-400" : "bg-indigo-400"
                    )}
                  >
                     <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 20px)` }} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Call to action & Progress */}
            <motion.div
              animate={{ y: isTearing ? 5 : 0 }}
              className="mt-12 text-center"
            >
              <h3 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm flex items-center justify-center gap-2">
                {taps > 2 ? <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" /> : null}
                {messages[Math.min(taps, messages.length - 1)]}
                {taps > 2 ? <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" /> : null}
              </h3>
              
              <div className="w-72 h-4 bg-gray-200/80 rounded-full mt-6 overflow-hidden mx-auto shadow-inner border border-gray-300">
                <motion.div 
                  className={cn(
                    "h-full rounded-full transition-all duration-300 relative overflow-hidden",
                    theme === 'love' ? "bg-gradient-to-r from-red-400 to-pink-500" : 
                    theme === 'party' ? "bg-gradient-to-r from-orange-400 to-amber-500" : 
                    "bg-gradient-to-r from-blue-400 to-indigo-500"
                  )}
                  style={{ width: `${Math.max(10, (taps / requiredTaps) * 100)}%` }}
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwbDhfOFpNOCAwTDBfOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMiIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-50"></div>
                </motion.div>
              </div>
            </motion.div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
