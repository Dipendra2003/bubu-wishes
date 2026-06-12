import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ThemeColors } from './ThemeGraphics';
import { Settings } from 'lucide-react';
import { ThemeType } from '../types';

interface CountdownLockProps {
  unlockDate: string;
  lockScreenImage?: string;
  allowSkipLock?: boolean;
  theme: ThemeType;
  onUnlock: () => void;
  isEditorPreview?: boolean;
  onEdit?: () => void;
}

export function CountdownLock({ unlockDate, lockScreenImage, allowSkipLock, theme, onUnlock, isEditorPreview, onEdit }: CountdownLockProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const targetDate = new Date(unlockDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setIsUnlocked(true);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockDate]);

  const colors = ThemeColors[theme] || ThemeColors.party;

  if (isUnlocked) {
    return (
      <div className={`min-h-[100dvh] w-full flex items-center justify-center p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-0"></div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center max-w-sm w-full relative z-10"
        >
         <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-40 h-40 sm:w-48 sm:h-48 mb-4 rounded-3xl overflow-hidden bg-white/50 border-[3px] border-white shadow-sm flex items-center justify-center p-2"
         >
            <img src="/happy.gif" alt="Bubu Dudu Cute" className="w-full h-full object-contain rounded-2xl" />
         </motion.div>
          <h2 className="text-3xl font-handwriting font-bold text-pink-600 mb-2">It's Time! Yayyy!</h2>
          <p className="text-gray-600 font-medium mb-6 text-sm">
            The wait is finally over! Bubu and Dudu are ready for you.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUnlock}
            className={`w-full py-3 px-6 rounded-2xl text-white font-bold text-lg shadow-pink-300/30 shadow-xl transition-all ${colors.accent || 'bg-pink-500'}`}
          >
            Open Card Now! ✨
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={i}
            className={`absolute rounded-full bg-white`}
            style={{
              width: Math.random() * 20 + 10,
              height: Math.random() * 20 + 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {isEditorPreview && onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/60 backdrop-blur-md border border-white/80 p-2 sm:p-3 rounded-full shadow-lg z-50 text-gray-700 hover:bg-white transition-all transform hover:scale-105"
        >
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {allowSkipLock && (
         <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
            <button
              onClick={() => setIsUnlocked(true)}
              className="bg-white/60 backdrop-blur-md border border-white/80 py-2 px-4 rounded-xl shadow-lg text-xs font-bold text-gray-700 hover:bg-white transition-all"
            >
              Skip Lock
            </button>
         </div>
      )}

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col items-center text-center max-w-md w-full relative z-10"
      >
        <motion.div
           animate={{ y: [0, -5, 0] }}
           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
           className="w-32 h-32 sm:w-40 sm:h-40 mb-4 rounded-3xl overflow-hidden bg-white/50 border-[3px] border-white shadow-sm flex items-center justify-center p-2"
        >
             <img src={lockScreenImage || "/waiting.gif"} alt="Waiting Box" className="w-full h-full object-contain rounded-2xl" />
        </motion.div>
        
        <h2 className="text-2xl md:text-3xl font-handwriting font-bold text-pink-500 mb-2">
          No Peeking Yet!
        </h2>
        <p className="text-sm font-medium text-gray-600 mb-8 max-w-[250px]">
          Bubu is waiting... This surprise is locked until a specific time!
        </p>

        <div className="flex gap-2 sm:gap-4 w-full justify-center">
          <TimeUnit value={timeLeft.days} label="Days" />
          <div className="text-2xl font-bold text-gray-400 self-start mt-2">:</div>
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <div className="text-2xl font-bold text-gray-400 self-start mt-2">:</div>
          <TimeUnit value={timeLeft.minutes} label="Mins" />
          <div className="text-2xl font-bold text-gray-400 self-start mt-2">:</div>
          <TimeUnit value={timeLeft.seconds} label="Secs" />
        </div>
      </motion.div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/60 rounded-xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border border-white shadow-sm mb-2">
        <span className="text-xl sm:text-2xl font-bold text-gray-800">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}
