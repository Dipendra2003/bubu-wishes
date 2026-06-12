import React from 'react';
import { ThemeType, PhotoType } from '../types';

export const ThemeColors = {
  party: {
    bg: 'bg-amber-50',
    cardOutside: 'bg-gradient-to-br from-amber-100 to-yellow-200',
    cardInside: 'bg-[#fffaeb]',
    text: 'text-amber-900',
    accent: 'bg-yellow-400',
  },
  love: {
    bg: 'bg-rose-50',
    cardOutside: 'bg-gradient-to-br from-rose-100 to-pink-200',
    cardInside: 'bg-[#fff0f3]',
    text: 'text-rose-900',
    accent: 'bg-rose-400',
  },
  sleepy: {
    bg: 'bg-indigo-50',
    cardOutside: 'bg-gradient-to-br from-indigo-100 to-blue-200',
    cardInside: 'bg-[#f5f8ff]',
    text: 'text-indigo-900',
    accent: 'bg-indigo-400',
  },
  valentine: {
    bg: 'bg-red-50',
    cardOutside: 'bg-gradient-to-br from-red-100 to-rose-300',
    cardInside: 'bg-[#fff0f3]',
    text: 'text-red-900',
    accent: 'bg-red-500',
  },
  newyear: {
    bg: 'bg-slate-50',
    cardOutside: 'bg-gradient-to-br from-slate-200 to-amber-100',
    cardInside: 'bg-[#f8fafc]',
    text: 'text-slate-900',
    accent: 'bg-amber-500',
  },
  christmas: {
    bg: 'bg-emerald-50',
    cardOutside: 'bg-gradient-to-br from-emerald-100 to-red-100',
    cardInside: 'bg-[#f0fdf4]',
    text: 'text-emerald-900',
    accent: 'bg-emerald-500',
  }
};

// Generic cute bear face component
const BearFace = ({ color, ears, eyeType = 'open', blush = true }: any) => (
  <g>
    <circle cx="50" cy="50" r="40" fill={color} />
    <circle cx="20" cy="25" r="15" fill={ears} />
    <circle cx="80" cy="25" r="15" fill={ears} />
    {/* Inner ears */}
    <circle cx="20" cy="25" r="8" fill="#fecdd3" opacity="0.6"/>
    <circle cx="80" cy="25" r="8" fill="#fecdd3" opacity="0.6"/>
    
    {blush && (
      <>
        <ellipse cx="25" cy="55" rx="8" ry="4" fill="#fecdd3" opacity="0.8" />
        <ellipse cx="75" cy="55" rx="8" ry="4" fill="#fecdd3" opacity="0.8" />
      </>
    )}

    {eyeType === 'open' ? (
      <>
        <circle cx="35" cy="45" r="4" fill="#3f3f46" />
        <circle cx="65" cy="45" r="4" fill="#3f3f46" />
        <circle cx="33" cy="44" r="1.5" fill="white" />
        <circle cx="63" cy="44" r="1.5" fill="white" />
      </>
    ) : eyeType === 'closed' ? (
      <>
        <path d="M 30 45 Q 35 40 40 45" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" />
        <path d="M 60 45 Q 65 40 70 45" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" />
      </>
    ) : (
      <>
        <path d="M 30 43 Q 35 48 40 43" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" />
        <path d="M 60 43 Q 65 48 70 43" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" />
      </>
    )}
    
    <path d="M 45 55 Q 50 60 55 55" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" />
    <circle cx="50" cy="53" r="3" fill="#3f3f46" />
  </g>
);

export const BubuDuduParty = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-lg pb-4">
      {/* Background Banners */}
      <path d="M 10 25 Q 50 45 100 25 Q 150 45 190 25" fill="none" stroke="#fbbf24" strokeWidth="2" />
      <polygon points="20,30 30,22 40,33" fill="#f472b6" />
      <polygon points="60,38 70,30 80,41" fill="#60a5fa" />
      <polygon points="120,38 130,30 140,41" fill="#34d399" />
      <polygon points="160,30 170,22 180,33" fill="#fb7185" />
      
      {/* Confetti / background elements */}
      <circle cx="20" cy="50" r="3" fill="#fbbf24" />
      <circle cx="170" cy="60" r="4" fill="#f472b6" />
      <circle cx="100" cy="10" r="3" fill="#60a5fa" />
      <circle cx="40" cy="110" r="4" fill="#34d399" />
      <circle cx="180" cy="100" r="3" fill="#fcd34d" />
      <polygon points="25,12 28,15 22,18" fill="#ec4899" />
      <polygon points="155,15 158,10 162,14" fill="#3b82f6" />
      <polygon points="85,55 88,52 92,57" fill="#10b981" />
      
      {/* Floating Balloons */}
      <g transform="translate(160, 40)">
        <path d="M 0 0 C -15 -20 -15 -40 0 -40 C 15 -40 15 -20 0 0 Z" fill="#60a5fa" opacity="0.85" />
        <path d="M 0 0 L -5 5 L 5 5 Z" fill="#60a5fa" />
        <path d="M 0 5 Q -5 15 5 25" fill="none" stroke="#94a3b8" strokeWidth="1" />
        <ellipse cx="-4" cy="-25" rx="2" ry="5" fill="#fff" opacity="0.4" transform="rotate(20 -4 -25)" />
      </g>
      <g transform="translate(30, 60)">
        <path d="M 0 0 C -12 -16 -12 -32 0 -32 C 12 -32 12 -16 0 0 Z" fill="#f472b6" opacity="0.85" />
        <path d="M 0 0 L -4 4 L 4 4 Z" fill="#f472b6" />
        <path d="M 0 4 Q 5 12 -5 20" fill="none" stroke="#94a3b8" strokeWidth="1" />
        <ellipse cx="-3" cy="-20" rx="1.5" ry="4" fill="#fff" opacity="0.4" transform="rotate(20 -3 -20)" />
      </g>
      
      {/* Dudu (Brown Bear) */}
      <g transform="translate(90, 45) scale(0.9)">
        <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
        {/* Party Hat */}
        <path d="M 30 15 L 60 15 L 45 -20 Z" fill="#60a5fa" />
        <circle cx="45" cy="-20" r="6" fill="#fcd34d" />
        <circle cx="45" cy="-5" r="3" fill="#fff" opacity="0.5" />
        <circle cx="38" cy="5" r="3" fill="#fff" opacity="0.5" />
        <circle cx="52" cy="8" r="3" fill="#fff" opacity="0.5" />
      </g>

      {/* Bubu (White Bear) */}
      <g transform="translate(10, 45) scale(0.9)">
        <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="closed" blush={true} />
        {/* Party Hat */}
        <path d="M 35 18 L 65 18 L 55 -15 Z" fill="#f472b6" />
        <circle cx="55" cy="-15" r="5" fill="#fcd34d" />
        <path d="M 45 0 L 55 5 L 45 10 L 55 15" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />
      </g>

      {/* Bigger Cake in middle */}
      <g transform="translate(75, 85) scale(1.1)">
        {/* Plate */}
        <ellipse cx="20" cy="40" rx="30" ry="10" fill="#e2e8f0" />
        <ellipse cx="20" cy="43" rx="28" ry="8" fill="#cbd5e1" opacity="0.5" />
        
        {/* Base Layer */}
        <rect x="-5" y="25" width="50" height="15" fill="#fcd34d" rx="3" />
        {/* Top Layer */}
        <rect x="0" y="15" width="40" height="10" fill="#fbbf24" rx="2" />
        
        {/* Frosting */}
        <path d="M -5 25 Q 0 30 5 25 T 15 25 T 25 25 T 35 25 T 45 25 V 15 Q 35 10 25 15 T 5 15 T -5 15 Z" fill="#fb7185" />
        {/* Frosting drips */}
        <circle cx="5" cy="27" r="3" fill="#fb7185" />
        <circle cx="15" cy="29" r="3.5" fill="#fb7185" />
        <circle cx="28" cy="28" r="3" fill="#fb7185" />
        <circle cx="40" cy="26" r="2.5" fill="#fb7185" />
        
        {/* Sprinkles on plate/cake */}
        <line x1="0" y1="35" x2="3" y2="33" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="30" y1="35" x2="33" y2="33" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="28" x2="23" y2="30" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Candles */}
        <g transform="translate(0, -3)">
          <rect x="12" y="-5" width="4" height="15" fill="#fff" />
          <path d="M 12 0 L 16 -3 L 12 -6 Z" fill="#f472b6" />
          <circle cx="14" cy="-10" r="3" fill="#f59e0b" className="animate-pulse" />
          <circle cx="14" cy="-14" r="1.5" fill="#fcd34d" className="animate-pulse" />
          
          <rect x="24" y="-5" width="4" height="15" fill="#fff" />
          <path d="M 24 0 L 28 -3 L 24 -6 Z" fill="#60a5fa" />
          <circle cx="26" cy="-10" r="3" fill="#f59e0b" className="animate-pulse" />
          <circle cx="26" cy="-14" r="1.5" fill="#fcd34d" className="animate-pulse" />
        </g>
      </g>
    </svg>
);

export const BubuDuduLove = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-md pb-4">
      {/* Hearts */}
      <g fill="#fb7185" transform="scale(0.5) translate(60, 40)">
        <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
      </g>
      <g fill="#f43f5e" transform="scale(0.8) translate(180, 20) rotate(15)">
        <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
      </g>
      <g fill="#fecdd3" transform="scale(0.4) translate(300, 180) rotate(-15)">
        <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
      </g>

      {/* Dudu (Brown Bear) */}
      <g transform="translate(85, 45) scale(0.9) rotate(-10)">
        <BearFace color="#d4a373" ears="#a98467" eyeType="closed" blush={true} />
      </g>

      {/* Bubu (White Bear) */}
      <g transform="translate(25, 45) scale(0.9) rotate(10)">
        <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="open" blush={true} />
      </g>
      
      {/* Big central heart they hold together */}
      <g fill="#f43f5e" transform="translate(85, 95) scale(0.4)">
        <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
      </g>
    </svg>
);

export const BubuDuduValentine = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-lg pb-4">
      {/* Background Hearts */}
      <g fill="#fecaca" transform="scale(0.8) translate(30, 20)">
        <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
      </g>
      <g fill="#fecaca" transform="scale(0.5) translate(250, 40) rotate(20)">
        <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
      </g>
      <g fill="#f87171" transform="scale(0.4) translate(100, 250) rotate(-15)">
        <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
      </g>

      {/* Dudu (Brown Bear) */}
      <g transform="translate(85, 45) scale(0.9) rotate(-5)">
        <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
        {/* Holding a rose */}
        <path d="M 30 55 Q 10 70 -5 90" fill="none" stroke="#22c55e" strokeWidth="2" />
        <circle cx="-5" cy="90" r="4" fill="#ef4444" />
        <circle cx="-2" cy="88" r="3" fill="#ef4444" />
        <circle cx="-8" cy="88" r="3" fill="#ef4444" />
      </g>

      {/* Bubu (White Bear) */}
      <g transform="translate(25, 45) scale(0.9) rotate(5)">
        <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="closed" blush={true} />
        {/* Big blush */}
        <ellipse cx="25" cy="55" rx="10" ry="5" fill="#fca5a5" opacity="0.9" />
        <ellipse cx="75" cy="55" rx="10" ry="5" fill="#fca5a5" opacity="0.9" />
      </g>
      
      {/* Box of chocolates */}
      <g transform="translate(70, 110) scale(0.8)">
        <polygon points="0,0 40,-10 60,0 20,10" fill="#f43f5e" />
        <polygon points="20,10 60,0 60,10 20,20" fill="#e11d48" />
        <polygon points="0,0 20,10 20,20 0,10" fill="#be123c" />
        <path d="M 20 -5 L 40 5 M 10 0 L 30 10 M 30 -5 L 50 5" stroke="#fecdd3" strokeWidth="1.5" />
      </g>

      {/* Big heart in center top */}
      <g fill="#ef4444" transform="translate(75, 5) scale(0.6)">
        <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
        <path d="M 20 25 Q 30 15 45 30" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
);

export const BubuDuduSleepy = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-md pb-4">
      <path d="M 40 20 L 42 26 L 48 26 L 43 30 L 45 36 L 40 32 L 35 36 L 37 30 L 32 26 L 38 26 Z" fill="#fde047" />
      <path d="M 160 30 L 161 33 L 164 33 L 162 35 L 163 38 L 160 36 L 157 38 L 158 35 L 156 33 L 159 33 Z" fill="#fde047" opacity="0.7"/>
      <path d="M 100 15 L 101 17 L 103 17 L 101.5 18.5 L 102 20.5 L 100 19 L 98 20.5 L 98.5 18.5 L 97 17 L 99 17 Z" fill="#fde047" opacity="0.5"/>

      {/* Zzz */}
      <text x="50" y="30" fontSize="12" fill="#94a3b8" fontFamily="sans-serif">Z</text>
      <text x="60" y="20" fontSize="16" fill="#94a3b8" fontFamily="sans-serif">z</text>

      {/* Bubu (White Bear) */}
      <g transform="translate(30, 50) scale(0.85) rotate(-5)">
        <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="sleepy" blush={true} />
      </g>

      {/* Dudu (Brown Bear) behind */}
      <g transform="translate(80, 55) scale(0.85) rotate(5)">
        <BearFace color="#d4a373" ears="#a98467" eyeType="sleepy" blush={true} />
      </g>
      
      {/* Blanket */}
      <path d="M 10 100 Q 100 80 190 100 L 180 130 L 20 130 Z" fill="#818cf8" />
      <path d="M 10 100 Q 100 80 190 100 L 190 105 Q 100 85 10 105 Z" fill="#a5b4fc" />
    </svg>
);

export const BubuDuduNewYear = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-lg pb-4">
      {/* Fireworks */}
      <g transform="translate(30, 30)">
        <path d="M 0 0 L 0 -15 M 0 0 L 10 -10 M 0 0 L 15 0 M 0 0 L 10 10 M 0 0 L 0 15 M 0 0 L -10 10 M 0 0 L -15 0 M 0 0 L -10 -10" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="0" cy="-18" r="1.5" fill="#fcd34d" />
        <circle cx="12" cy="-12" r="1.5" fill="#fcd34d" />
        <circle cx="-12" cy="-12" r="1.5" fill="#fcd34d" />
      </g>
      <g transform="translate(170, 40) scale(0.8)">
        <path d="M 0 0 L 0 -15 M 0 0 L 10 -10 M 0 0 L 15 0 M 0 0 L 10 10 M 0 0 L 0 15 M 0 0 L -10 10 M 0 0 L -15 0 M 0 0 L -10 -10" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="0" cy="-18" r="1.5" fill="#34d399" />
        <circle cx="12" cy="-12" r="1.5" fill="#34d399" />
      </g>

      {/* Dudu (Brown Bear) */}
      <g transform="translate(90, 50) scale(0.9)">
        <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
        <text x="35" y="65" fontSize="18" fontWeight="bold" fill="#f59e0b" style={{fontFamily: 'sans-serif'}} transform="rotate(-15 35 65)">2</text>
        <text x="50" y="60" fontSize="18" fontWeight="bold" fill="#f59e0b" style={{fontFamily: 'sans-serif'}} transform="rotate(-15 50 60)">0</text>
      </g>

      {/* Bubu (White Bear) */}
      <g transform="translate(20, 50) scale(0.9)">
        <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="open" blush={true} />
        <text x="35" y="60" fontSize="18" fontWeight="bold" fill="#f59e0b" style={{fontFamily: 'sans-serif'}} transform="rotate(15 35 60)">2</text>
        <text x="50" y="65" fontSize="18" fontWeight="bold" fill="#f59e0b" style={{fontFamily: 'sans-serif'}} transform="rotate(15 50 65)">4</text>
      </g>
      
      {/* Banner */}
      <path d="M 20 120 Q 100 135 180 120" fill="none" stroke="#ef4444" strokeWidth="15" strokeLinecap="round" />
      <text x="100" y="130" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" style={{fontFamily: 'sans-serif'}}>HAPPY NEW YEAR</text>
    </svg>
);

export const BubuDuduChristmas = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-lg pb-4">
      {/* Snow */}
      <circle cx="20" cy="20" r="1.5" fill="#fff" />
      <circle cx="80" cy="30" r="2" fill="#fff" />
      <circle cx="150" cy="15" r="1.5" fill="#fff" />
      <circle cx="180" cy="40" r="2" fill="#fff" />
      
      {/* Christmas Tree */}
      <g transform="translate(130, 40) scale(0.8)">
        <polygon points="30,0 10,30 20,30 0,60 60,60 40,30 50,30" fill="#10b981" />
        <rect x="25" y="60" width="10" height="15" fill="#78350f" />
        {/* Ornaments */}
        <circle cx="30" cy="20" r="3" fill="#ef4444" />
        <circle cx="20" cy="40" r="3" fill="#fcd34d" />
        <circle cx="45" cy="45" r="3" fill="#ef4444" />
        {/* Star */}
        <polygon points="30,-5 33,2 40,2 35,7 37,14 30,10 23,14 25,7 20,2 27,2" fill="#fbbf24" />
      </g>

      {/* Dudu (Brown Bear) */}
      <g transform="translate(60, 50) scale(0.9)">
        <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
        {/* Santa Hat */}
        <path d="M 25 15 L 65 15 L 45 -10 Z" fill="#ef4444" />
        <circle cx="45" cy="-10" r="6" fill="#fff" />
        <rect x="20" y="10" width="50" height="8" fill="#fff" rx="4" />
      </g>

      {/* Bubu (White Bear) */}
      <g transform="translate(10, 50) scale(0.9)">
        <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="closed" blush={true} />
        {/* Elf Hat */}
        <path d="M 30 18 L 60 18 L 45 -15 Q 60 -5 70 5" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
        <polygon points="25,18 65,18 45,-15" fill="#22c55e" />
        <circle cx="70" cy="5" r="4" fill="#fcd34d" />
      </g>
      
      {/* Presents */}
      <g transform="translate(90, 110) scale(0.6)">
        <rect x="0" y="0" width="40" height="40" fill="#ef4444" />
        <rect x="15" y="0" width="10" height="40" fill="#fde047" />
        <rect x="0" y="15" width="40" height="10" fill="#fde047" />
        {/* Bow */}
        <path d="M 20 0 Q 5 -15 20 -5 Q 35 -15 20 0" fill="#fde047" />
      </g>
    </svg>
);
export const ThemeIcon = ({ theme }: { theme: ThemeType }) => {
  switch (theme) {
    case 'party': return <BubuDuduParty />;
    case 'love': return <BubuDuduLove />;
    case 'sleepy': return <BubuDuduSleepy />;
    case 'valentine': return <BubuDuduValentine />;
    case 'newyear': return <BubuDuduNewYear />;
    case 'christmas': return <BubuDuduChristmas />;
    default: return <BubuDuduParty />;
  }
}

export const PhotoCake = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-100 shadow-inner">
      <g transform="translate(90, 40) scale(0.9)">
        <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
      </g>
      <g transform="translate(10, 40) scale(0.9)">
        <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="open" blush={true} />
      </g>
      <g transform="translate(80, 90)">
        <rect x="0" y="20" width="40" height="20" fill="#fcd34d" rx="2" />
        <rect x="0" y="20" width="40" height="8" fill="#fbbf24" rx="2" />
        <path d="M 0 20 Q 5 25 10 20 T 20 20 T 30 20 T 40 20 V 10 Q 30 5 20 10 T 0 10 Z" fill="#fb7185" />
        <rect x="18" y="-5" width="4" height="15" fill="#fff" />
        <circle cx="20" cy="-10" r="3" fill="#f59e0b" />
      </g>
    </svg>
);

export const PhotoHug = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-rose-100 shadow-inner">
      <g transform="translate(60, 45) scale(1) rotate(15)">
        <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="closed" blush={true} />
      </g>
      <g transform="translate(110, 45) scale(1) rotate(-15)">
        <BearFace color="#d4a373" ears="#a98467" eyeType="closed" blush={true} />
      </g>
      <path d="M 100 110 Q 120 110 120 130 Q 120 150 100 150 Q 80 150 80 130 Q 80 110 100 110" fill="#f43f5e" />
    </svg>
);

export const PhotoStargazing = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-200 shadow-inner">
      <circle cx="40" cy="30" r="4" fill="#fde047" />
      <circle cx="160" cy="50" r="3" fill="#fde047" />
      <circle cx="80" cy="20" r="2" fill="#fde047" />
      <circle cx="120" cy="70" r="5" fill="#fde047" opacity="0.6" />
      
      <g transform="translate(50, 70) scale(0.8)">
        <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="open" blush={true} />
      </g>
      <g transform="translate(110, 70) scale(0.8)">
        <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
      </g>
    </svg>
);

export const SurprisePhotoIcon = ({ photo }: { photo: PhotoType }) => {
  switch (photo) {
    case 'cake': return <PhotoCake />;
    case 'hug': return <PhotoHug />;
    case 'stargazing': return <PhotoStargazing />;
    default: return null;
  }
}
