import React from 'react';
import { ThemeType, PhotoType } from '../types';

export const ThemeColors = {
  party: {
    bg: 'bg-amber-50',
    cardOutside: 'bg-linear-to-br from-amber-100 to-yellow-200',
    cardInside: 'bg-[#fffaeb]',
    text: 'text-amber-900',
    accent: 'bg-yellow-400',
  },
  love: {
    bg: 'bg-rose-50',
    cardOutside: 'bg-linear-to-br from-rose-100 to-pink-200',
    cardInside: 'bg-[#fff0f3]',
    text: 'text-rose-900',
    accent: 'bg-rose-400',
  },
  sleepy: {
    bg: 'bg-indigo-50',
    cardOutside: 'bg-linear-to-br from-indigo-100 to-blue-200',
    cardInside: 'bg-[#f5f8ff]',
    text: 'text-indigo-900',
    accent: 'bg-indigo-400',
  },
  valentine: {
    bg: 'bg-red-50',
    cardOutside: 'bg-linear-to-br from-red-100 to-rose-300',
    cardInside: 'bg-[#fff0f3]',
    text: 'text-red-900',
    accent: 'bg-red-500',
  },
  newyear: {
    bg: 'bg-slate-50',
    cardOutside: 'bg-linear-to-br from-slate-200 to-amber-100',
    cardInside: 'bg-[#f8fafc]',
    text: 'text-slate-900',
    accent: 'bg-amber-500',
  },
  christmas: {
    bg: 'bg-emerald-50',
    cardOutside: 'bg-linear-to-br from-emerald-100 to-red-100',
    cardInside: 'bg-[#f0fdf4]',
    text: 'text-emerald-900',
    accent: 'bg-emerald-500',
  },
  romantic: {
    bg: 'bg-pink-50',
    cardOutside: 'bg-linear-to-br from-pink-100 to-fuchsia-200',
    cardInside: 'bg-[#fdf2f8]',
    text: 'text-fuchsia-900',
    accent: 'bg-fuchsia-400',
  },
  night: {
    bg: 'bg-slate-900',
    cardOutside: 'bg-linear-to-br from-slate-800 to-indigo-900',
    cardInside: 'bg-[#0f172a]',
    text: 'text-slate-100',
    accent: 'bg-indigo-400',
  },
  galaxy: {
    bg: 'bg-purple-900',
    cardOutside: 'bg-linear-to-br from-violet-800 to-fuchsia-900',
    cardInside: 'bg-[#2e1065]',
    text: 'text-purple-100',
    accent: 'bg-fuchsia-400',
  },
  forest: {
    bg: 'bg-green-50',
    cardOutside: 'bg-linear-to-br from-green-100 to-emerald-200',
    cardInside: 'bg-[#f0fdf4]',
    text: 'text-green-900',
    accent: 'bg-green-500',
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
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl pb-4 overflow-visible">
      <defs>
        {/* 3D Claymorphism filter for the bears and objects */}
        <filter id="clay-3d" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" result="shadow"/>
          <feComponentTransfer in="SourceAlpha" result="alpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="-2.5" dy="-2.5" result="offsetBlur"/>
          <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood floodColor="white" floodOpacity="0.75"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over" result="highlight"/>
          <feOffset in="blur" dx="2.5" dy="2.5" result="offsetBlur2"/>
          <feComposite in="offsetBlur2" in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff2"/>
          <feFlood floodColor="black" floodOpacity="0.1"/>
          <feComposite in2="shadowDiff2" operator="in"/>
          <feComposite in2="highlight" operator="over"/>
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <style>{`
        .party-anim-float-bubu { animation: party-float-bear 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .party-anim-float-dudu { animation: party-float-bear 3s ease-in-out infinite 1.5s; transform-origin: 50px 50px; }
        .party-anim-party-float-balloon1 { animation: party-float-balloon 4s ease-in-out infinite; transform-origin: 160px 40px; }
        .party-anim-party-float-balloon2 { animation: party-float-balloon 3.5s ease-in-out infinite 1s; transform-origin: 30px 60px; }
        .party-anim-party-float-cake { animation: party-float-cake 2.5s ease-in-out infinite 0.75s; }
        .party-anim-confetti { animation: party-spin-confetti 6s linear infinite; transform-origin: center; }
        
        @keyframes party-float-bear {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes party-float-balloon {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes party-float-cake {
          0%, 100% { transform: translateY(0) scale(1.1); }
          50% { transform: translateY(-3px) scale(1.1); }
        }
        @keyframes party-spin-confetti {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Background Banners */}
      <g filter="url(#clay-3d)">
        <path d="M 10 25 Q 50 45 100 25 Q 150 45 190 25" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
        <polygon points="20,30 30,22 40,33" fill="#f472b6" />
        <polygon points="60,38 70,30 80,41" fill="#60a5fa" />
        <polygon points="120,38 130,30 140,41" fill="#34d399" />
        <polygon points="160,30 170,22 180,33" fill="#fb7185" />
      </g>
      
      {/* Confetti / background elements */}
      <g className="party-anim-confetti">
        <circle cx="20" cy="50" r="3.5" fill="#fbbf24" filter="url(#glow)"/>
        <circle cx="170" cy="60" r="4.5" fill="#f472b6" filter="url(#glow)"/>
        <circle cx="100" cy="10" r="3.5" fill="#60a5fa" filter="url(#glow)"/>
        <circle cx="40" cy="110" r="4.5" fill="#34d399" filter="url(#glow)"/>
        <circle cx="180" cy="100" r="3.5" fill="#fcd34d" filter="url(#glow)"/>
        <polygon points="25,12 28,15 22,18" fill="#ec4899" />
        <polygon points="155,15 158,10 162,14" fill="#3b82f6" />
        <polygon points="85,55 88,52 92,57" fill="#10b981" />
      </g>
      
      {/* Floating Balloons */}
      <g className="party-anim-party-float-balloon1">
        <g transform="translate(160, 40)" filter="url(#clay-3d)">
          <path d="M 0 0 C -15 -20 -15 -40 0 -40 C 15 -40 15 -20 0 0 Z" fill="#60a5fa" opacity="0.95" />
          <path d="M 0 0 L -5 5 L 5 5 Z" fill="#60a5fa" />
          <path d="M 0 5 Q -5 15 5 25" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <ellipse cx="-4" cy="-25" rx="3" ry="7" fill="#fff" opacity="0.6" transform="rotate(20 -4 -25)" />
        </g>
      </g>
      
      <g className="party-anim-party-float-balloon2">
        <g transform="translate(30, 60)" filter="url(#clay-3d)">
          <path d="M 0 0 C -12 -16 -12 -32 0 -32 C 12 -32 12 -16 0 0 Z" fill="#f472b6" opacity="0.95" />
          <path d="M 0 0 L -4 4 L 4 4 Z" fill="#f472b6" />
          <path d="M 0 4 Q 5 12 -5 20" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <ellipse cx="-3" cy="-20" rx="2.5" ry="6" fill="#fff" opacity="0.6" transform="rotate(20 -3 -20)" />
        </g>
      </g>
      
      {/* Dudu (Brown Bear) */}
      <g className="party-anim-float-dudu">
        <g transform="translate(90, 45) scale(0.95)" filter="url(#clay-3d)">
          <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
          {/* Party Hat */}
          <path d="M 30 15 L 60 15 L 45 -20 Z" fill="#60a5fa" />
          <circle cx="45" cy="-20" r="7" fill="#fcd34d" />
          <circle cx="45" cy="-5" r="3.5" fill="#fff" opacity="0.8" />
          <circle cx="38" cy="5" r="3.5" fill="#fff" opacity="0.8" />
          <circle cx="52" cy="8" r="3.5" fill="#fff" opacity="0.8" />
        </g>
      </g>

      {/* Bubu (White Bear) */}
      <g className="party-anim-float-bubu">
        <g transform="translate(10, 45) scale(0.95)" filter="url(#clay-3d)">
          <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="closed" blush={true} />
          {/* Party Hat */}
          <path d="M 35 18 L 65 18 L 55 -15 Z" fill="#f472b6" />
          <circle cx="55" cy="-15" r="6" fill="#fcd34d" />
          <path d="M 45 0 L 55 5 L 45 10 L 55 15" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.8" />
        </g>
      </g>

      {/* Bigger Cake in middle */}
      <g className="party-anim-party-float-cake" transform="translate(75, 85)">
        <g filter="url(#clay-3d)">
          {/* Plate */}
          <ellipse cx="20" cy="40" rx="35" ry="12" fill="#e2e8f0" />
          <ellipse cx="20" cy="43" rx="32" ry="10" fill="#cbd5e1" opacity="0.7" />
          
          {/* Base Layer */}
          <rect x="-10" y="22" width="60" height="18" fill="#fcd34d" rx="4" />
          {/* Top Layer */}
          <rect x="-2" y="10" width="44" height="12" fill="#fbbf24" rx="3" />
          
          {/* Frosting */}
          <path d="M -10 22 Q -2 28 5 22 T 18 22 T 30 22 T 42 22 T 50 22 V 10 Q 35 4 20 10 T 0 10 T -10 10 Z" fill="#fb7185" />
          {/* Frosting drips */}
          <circle cx="2" cy="25" r="3.5" fill="#fb7185" />
          <circle cx="15" cy="28" r="4.5" fill="#fb7185" />
          <circle cx="30" cy="27" r="4" fill="#fb7185" />
          <circle cx="45" cy="25" r="3.5" fill="#fb7185" />
          
          {/* Sprinkles on plate/cake */}
          <line x1="-2" y1="35" x2="2" y2="33" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="35" x2="36" y2="33" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="28" x2="24" y2="30" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        </g>
        
        {/* Candles */}
        <g transform="translate(0, -6)">
          <rect x="10" y="-8" width="5" height="18" fill="#fff" rx="1"/>
          <path d="M 10 -1 L 15 -4 L 10 -7 Z" fill="#f472b6" />
          <circle cx="12.5" cy="-14" r="4" fill="#f59e0b" filter="url(#glow)" className="animate-pulse" />
          <circle cx="12.5" cy="-18" r="2" fill="#fcd34d" className="animate-pulse" />
          
          <rect x="25" y="-8" width="5" height="18" fill="#fff" rx="1"/>
          <path d="M 25 -1 L 30 -4 L 25 -7 Z" fill="#60a5fa" />
          <circle cx="27.5" cy="-14" r="4" fill="#f59e0b" filter="url(#glow)" className="animate-pulse" />
          <circle cx="27.5" cy="-18" r="2" fill="#fcd34d" className="animate-pulse" />
        </g>
      </g>
    </svg>
);

export const BubuDuduLove = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl pb-4 overflow-visible">
      <defs>
        <filter id="clay-3d-love" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" result="shadow"/>
          <feComponentTransfer in="SourceAlpha" result="alpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="-2.5" dy="-2.5" result="offsetBlur"/>
          <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood floodColor="white" floodOpacity="0.75"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over" result="highlight"/>
          <feOffset in="blur" dx="2.5" dy="2.5" result="offsetBlur2"/>
          <feComposite in="offsetBlur2" in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff2"/>
          <feFlood floodColor="black" floodOpacity="0.1"/>
          <feComposite in2="shadowDiff2" operator="in"/>
          <feComposite in2="highlight" operator="over"/>
        </filter>
      </defs>
      <style>{`
        .love-anim-float-bubu { animation: love-float-bear 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .love-anim-float-dudu { animation: love-float-bear 3s ease-in-out infinite 1.5s; transform-origin: 50px 50px; }
        .love-anim-heart { animation: love-pulse-heart 2s ease-in-out infinite; transform-origin: 85px 95px; }
        @keyframes love-float-bear { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(2deg); } }
        @keyframes love-pulse-heart { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>

      {/* Hearts */}
      <g filter="url(#clay-3d-love)">
        <g fill="#fb7185" transform="scale(0.5) translate(60, 40)">
          <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
        </g>
        <g fill="#f43f5e" transform="scale(0.8) translate(180, 20) rotate(15)">
          <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
        </g>
        <g fill="#fecdd3" transform="scale(0.4) translate(300, 180) rotate(-15)">
          <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
        </g>
      </g>

      {/* Dudu (Brown Bear) */}
      <g className="love-anim-float-dudu">
        <g transform="translate(85, 45) scale(0.9) rotate(-10)" filter="url(#clay-3d-love)">
          <BearFace color="#d4a373" ears="#a98467" eyeType="closed" blush={true} />
        </g>
      </g>

      {/* Bubu (White Bear) */}
      <g className="love-anim-float-bubu">
        <g transform="translate(25, 45) scale(0.9) rotate(10)" filter="url(#clay-3d-love)">
          <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="open" blush={true} />
        </g>
      </g>
      
      {/* Big central heart they hold together */}
      <g className="love-anim-heart">
        <g fill="#f43f5e" transform="translate(85, 95) scale(0.4)" filter="url(#clay-3d-love)">
          <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
        </g>
      </g>
    </svg>
);

export const BubuDuduValentine = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl pb-4 overflow-visible">
      <defs>
        <filter id="clay-3d-val" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" result="shadow"/>
          <feComponentTransfer in="SourceAlpha" result="alpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="-2.5" dy="-2.5" result="offsetBlur"/>
          <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood floodColor="white" floodOpacity="0.75"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over" result="highlight"/>
          <feOffset in="blur" dx="2.5" dy="2.5" result="offsetBlur2"/>
          <feComposite in="offsetBlur2" in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff2"/>
          <feFlood floodColor="black" floodOpacity="0.1"/>
          <feComposite in2="shadowDiff2" operator="in"/>
          <feComposite in2="highlight" operator="over"/>
        </filter>
      </defs>
      <style>{`
        .val-anim-float-bubu { animation: val-float-bear 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .val-anim-float-dudu { animation: val-float-bear 3s ease-in-out infinite 1.5s; transform-origin: 50px 50px; }
        .val-anim-heart { animation: val-pulse-heart 2s ease-in-out infinite; transform-origin: center; }
        @keyframes val-float-bear { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(2deg); } }
        @keyframes val-pulse-heart { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>

      {/* Background Hearts */}
      <g className="val-anim-heart" filter="url(#clay-3d-val)">
        <g fill="#fecaca" transform="scale(0.8) translate(30, 20)">
          <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
        </g>
        <g fill="#fecaca" transform="scale(0.5) translate(250, 40) rotate(20)">
          <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
        </g>
        <g fill="#f87171" transform="scale(0.4) translate(100, 250) rotate(-15)">
          <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
        </g>
      </g>

      {/* Dudu (Brown Bear) */}
      <g className="val-anim-float-dudu">
        <g transform="translate(85, 45) scale(0.9) rotate(-5)" filter="url(#clay-3d-val)">
          <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
          {/* Holding a rose */}
          <path d="M 30 55 Q 10 70 -5 90" fill="none" stroke="#22c55e" strokeWidth="2.5" />
          <circle cx="-5" cy="90" r="4.5" fill="#ef4444" />
          <circle cx="-2" cy="88" r="3.5" fill="#ef4444" />
          <circle cx="-8" cy="88" r="3.5" fill="#ef4444" />
        </g>
      </g>

      {/* Bubu (White Bear) */}
      <g className="val-anim-float-bubu">
        <g transform="translate(25, 45) scale(0.9) rotate(5)" filter="url(#clay-3d-val)">
          <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="closed" blush={true} />
          {/* Big blush */}
          <ellipse cx="25" cy="55" rx="10" ry="5" fill="#fca5a5" opacity="0.9" />
          <ellipse cx="75" cy="55" rx="10" ry="5" fill="#fca5a5" opacity="0.9" />
        </g>
      </g>
      
      {/* Box of chocolates */}
      <g className="val-anim-float-dudu">
        <g transform="translate(70, 110) scale(0.8)" filter="url(#clay-3d-val)">
          <polygon points="0,0 40,-10 60,0 20,10" fill="#f43f5e" />
          <polygon points="20,10 60,0 60,10 20,20" fill="#e11d48" />
          <polygon points="0,0 20,10 20,20 0,10" fill="#be123c" />
          <path d="M 20 -5 L 40 5 M 10 0 L 30 10 M 30 -5 L 50 5" stroke="#fecdd3" strokeWidth="2" />
        </g>
      </g>

      {/* Big heart in center top */}
      <g className="val-anim-heart">
        <g fill="#ef4444" transform="translate(75, 5) scale(0.6)" filter="url(#clay-3d-val)">
          <path d="M 50 20 A 15 15 0 0 0 20 20 A 15 15 0 0 0 -10 20 Q -10 40 20 60 Q 50 40 50 20 Z" />
          <path d="M 20 25 Q 30 15 45 30" fill="none" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
    </svg>
);

export const BubuDuduSleepy = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl pb-4 overflow-visible">
      <defs>
        <filter id="clay-3d-sleep" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" result="shadow"/>
          <feComponentTransfer in="SourceAlpha" result="alpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="-2.5" dy="-2.5" result="offsetBlur"/>
          <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood floodColor="white" floodOpacity="0.75"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over" result="highlight"/>
          <feOffset in="blur" dx="2.5" dy="2.5" result="offsetBlur2"/>
          <feComposite in="offsetBlur2" in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff2"/>
          <feFlood floodColor="black" floodOpacity="0.1"/>
          <feComposite in2="shadowDiff2" operator="in"/>
          <feComposite in2="highlight" operator="over"/>
        </filter>
        <filter id="glow-sleep">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <style>{`
        .sleep-anim-sleep-breathe { animation: sleep-breathe 4s ease-in-out infinite; transform-origin: center; }
        .sleep-anim-zzz { animation: sleep-float-zzz 3s ease-in-out infinite; opacity: 0; }
        .sleep-anim-zzz-delay { animation: sleep-float-zzz 3s ease-in-out infinite 1.5s; opacity: 0; }
        @keyframes sleep-breathe { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.03) translateY(-2px); } }
        @keyframes sleep-float-zzz { 0% { transform: translateY(0) scale(0.8); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-20px) scale(1.2); opacity: 0; } }
      `}</style>

      <g filter="url(#glow-sleep)">
        <path d="M 40 20 L 42 26 L 48 26 L 43 30 L 45 36 L 40 32 L 35 36 L 37 30 L 32 26 L 38 26 Z" fill="#fde047" />
        <path d="M 160 30 L 161 33 L 164 33 L 162 35 L 163 38 L 160 36 L 157 38 L 158 35 L 156 33 L 159 33 Z" fill="#fde047" opacity="0.8"/>
        <path d="M 100 15 L 101 17 L 103 17 L 101.5 18.5 L 102 20.5 L 100 19 L 98 20.5 L 98.5 18.5 L 97 17 L 99 17 Z" fill="#fde047" opacity="0.6"/>
      </g>

      {/* Zzz */}
      <text x="50" y="30" fontSize="14" fill="#94a3b8" fontFamily="sans-serif" className="sleep-anim-zzz" fontWeight="bold">Z</text>
      <text x="65" y="15" fontSize="18" fill="#94a3b8" fontFamily="sans-serif" className="sleep-anim-zzz-delay" fontWeight="bold">z</text>

      {/* Bubu (White Bear) */}
      <g className="sleep-anim-sleep-breathe">
        <g transform="translate(30, 50) scale(0.85) rotate(-5)" filter="url(#clay-3d-sleep)">
          <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="sleepy" blush={true} />
        </g>
      </g>

      {/* Dudu (Brown Bear) behind */}
      <g className="sleep-anim-sleep-breathe" style={{ animationDelay: '1s' }}>
        <g transform="translate(80, 55) scale(0.85) rotate(5)" filter="url(#clay-3d-sleep)">
          <BearFace color="#d4a373" ears="#a98467" eyeType="sleepy" blush={true} />
        </g>
      </g>
      
      {/* Blanket */}
      <g className="sleep-anim-sleep-breathe" filter="url(#clay-3d-sleep)">
        <path d="M 10 100 Q 100 80 190 100 L 180 130 L 20 130 Z" fill="#818cf8" />
        <path d="M 10 100 Q 100 80 190 100 L 190 105 Q 100 85 10 105 Z" fill="#a5b4fc" />
      </g>
    </svg>
);

export const BubuDuduNewYear = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl pb-4 overflow-visible">
      <defs>
        <filter id="clay-3d-ny" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" result="shadow"/>
          <feComponentTransfer in="SourceAlpha" result="alpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="-2.5" dy="-2.5" result="offsetBlur"/>
          <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood floodColor="white" floodOpacity="0.75"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over" result="highlight"/>
          <feOffset in="blur" dx="2.5" dy="2.5" result="offsetBlur2"/>
          <feComposite in="offsetBlur2" in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff2"/>
          <feFlood floodColor="black" floodOpacity="0.1"/>
          <feComposite in2="shadowDiff2" operator="in"/>
          <feComposite in2="highlight" operator="over"/>
        </filter>
        <filter id="glow-ny">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <style>{`
        .ny-anim-float-bubu { animation: ny-float-bear 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .ny-anim-float-dudu { animation: ny-float-bear 3s ease-in-out infinite 1.5s; transform-origin: 50px 50px; }
        .ny-anim-firework { animation: ny-pop-firework 2s ease-out infinite; transform-origin: center; }
        .ny-anim-firework-delay { animation: ny-pop-firework 2s ease-out infinite 1s; transform-origin: center; }
        @keyframes ny-float-bear { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(2deg); } }
        @keyframes ny-pop-firework { 0% { transform: scale(0); opacity: 1; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1.3); opacity: 0; } }
      `}</style>

      {/* Fireworks */}
      <g className="ny-anim-firework" filter="url(#glow-ny)">
        <g transform="translate(30, 30)">
          <path d="M 0 0 L 0 -15 M 0 0 L 10 -10 M 0 0 L 15 0 M 0 0 L 10 10 M 0 0 L 0 15 M 0 0 L -10 10 M 0 0 L -15 0 M 0 0 L -10 -10" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="0" cy="-18" r="2.5" fill="#fcd34d" />
          <circle cx="12" cy="-12" r="2.5" fill="#fcd34d" />
          <circle cx="-12" cy="-12" r="2.5" fill="#fcd34d" />
        </g>
      </g>
      <g className="ny-anim-firework-delay" filter="url(#glow-ny)">
        <g transform="translate(170, 40) scale(0.8)">
          <path d="M 0 0 L 0 -15 M 0 0 L 10 -10 M 0 0 L 15 0 M 0 0 L 10 10 M 0 0 L 0 15 M 0 0 L -10 10 M 0 0 L -15 0 M 0 0 L -10 -10" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="0" cy="-18" r="2.5" fill="#34d399" />
          <circle cx="12" cy="-12" r="2.5" fill="#34d399" />
        </g>
      </g>

      {/* Dudu (Brown Bear) */}
      <g className="ny-anim-float-dudu">
        <g transform="translate(90, 50) scale(0.9)" filter="url(#clay-3d-ny)">
          <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
          <text x="35" y="65" fontSize="22" fontWeight="black" fill="#f59e0b" style={{fontFamily: 'sans-serif'}} transform="rotate(-15 35 65)">2</text>
          <text x="50" y="60" fontSize="22" fontWeight="black" fill="#f59e0b" style={{fontFamily: 'sans-serif'}} transform="rotate(-15 50 60)">0</text>
        </g>
      </g>

      {/* Bubu (White Bear) */}
      <g className="ny-anim-float-bubu">
        <g transform="translate(20, 50) scale(0.9)" filter="url(#clay-3d-ny)">
          <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="open" blush={true} />
          <text x="35" y="60" fontSize="22" fontWeight="black" fill="#f59e0b" style={{fontFamily: 'sans-serif'}} transform="rotate(15 35 60)">2</text>
          <text x="50" y="65" fontSize="22" fontWeight="black" fill="#f59e0b" style={{fontFamily: 'sans-serif'}} transform="rotate(15 50 65)">4</text>
        </g>
      </g>
      
      {/* Banner */}
      <g filter="url(#clay-3d-ny)">
        <path d="M 20 120 Q 100 135 180 120" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" />
        <text x="100" y="130" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="900" style={{fontFamily: 'sans-serif'}}>HAPPY NEW YEAR</text>
      </g>
    </svg>
);

export const BubuDuduChristmas = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl pb-4 overflow-visible">
      <defs>
        <filter id="clay-3d-xmas" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" result="shadow"/>
          <feComponentTransfer in="SourceAlpha" result="alpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="-2.5" dy="-2.5" result="offsetBlur"/>
          <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood floodColor="white" floodOpacity="0.75"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over" result="highlight"/>
          <feOffset in="blur" dx="2.5" dy="2.5" result="offsetBlur2"/>
          <feComposite in="offsetBlur2" in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff2"/>
          <feFlood floodColor="black" floodOpacity="0.1"/>
          <feComposite in2="shadowDiff2" operator="in"/>
          <feComposite in2="highlight" operator="over"/>
        </filter>
        <filter id="glow-xmas">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <style>{`
        .xmas-anim-float-bubu { animation: xmas-float-bear 3s ease-in-out infinite; transform-origin: 50px 50px; }
        .xmas-anim-float-dudu { animation: xmas-float-bear 3s ease-in-out infinite 1.5s; transform-origin: 50px 50px; }
        .xmas-anim-snow { animation: xmas-fall-snow 4s linear infinite; }
        @keyframes xmas-float-bear { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(2deg); } }
        @keyframes xmas-fall-snow { 0% { transform: translateY(-20px); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(40px); opacity: 0; } }
      `}</style>

      {/* Snow */}
      <g className="xmas-anim-snow" filter="url(#glow-xmas)">
        <circle cx="20" cy="20" r="2" fill="#fff" />
        <circle cx="80" cy="30" r="2.5" fill="#fff" />
        <circle cx="150" cy="15" r="2" fill="#fff" />
        <circle cx="180" cy="40" r="2.5" fill="#fff" />
      </g>
      
      {/* Christmas Tree */}
      <g transform="translate(130, 40) scale(0.8)" filter="url(#clay-3d-xmas)">
        <polygon points="30,0 10,30 20,30 0,60 60,60 40,30 50,30" fill="#10b981" />
        <rect x="25" y="60" width="10" height="15" fill="#78350f" />
        {/* Ornaments */}
        <circle cx="30" cy="20" r="3.5" fill="#ef4444" />
        <circle cx="20" cy="40" r="3.5" fill="#fcd34d" />
        <circle cx="45" cy="45" r="3.5" fill="#ef4444" />
        {/* Star */}
        <polygon points="30,-5 33,2 40,2 35,7 37,14 30,10 23,14 25,7 20,2 27,2" fill="#fbbf24" />
      </g>

      {/* Dudu (Brown Bear) */}
      <g className="xmas-anim-float-dudu">
        <g transform="translate(60, 50) scale(0.9)" filter="url(#clay-3d-xmas)">
          <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
          {/* Santa Hat */}
          <path d="M 25 15 L 65 15 L 45 -10 Z" fill="#ef4444" />
          <circle cx="45" cy="-10" r="7" fill="#fff" />
          <rect x="20" y="10" width="50" height="10" fill="#fff" rx="5" />
        </g>
      </g>

      {/* Bubu (White Bear) */}
      <g className="xmas-anim-float-bubu">
        <g transform="translate(10, 50) scale(0.9)" filter="url(#clay-3d-xmas)">
          <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="closed" blush={true} />
          {/* Elf Hat */}
          <path d="M 30 18 L 60 18 L 45 -15 Q 60 -5 70 5" fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" />
          <polygon points="25,18 65,18 45,-15" fill="#22c55e" />
          <circle cx="70" cy="5" r="5" fill="#fcd34d" />
        </g>
      </g>
      
      {/* Presents */}
      <g transform="translate(90, 110) scale(0.6)" filter="url(#clay-3d-xmas)">
        <rect x="0" y="0" width="40" height="40" fill="#ef4444" rx="2" />
        <rect x="15" y="0" width="10" height="40" fill="#fde047" />
        <rect x="0" y="15" width="40" height="10" fill="#fde047" />
        {/* Bow */}
        <path d="M 20 0 Q 5 -15 20 -5 Q 35 -15 20 0" fill="#fde047" />
      </g>
    </svg>
);

export const BubuDuduRomantic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl pb-4 overflow-visible">
      <defs>
        <filter id="clay-3d-rom" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" result="shadow"/>
          <feComponentTransfer in="SourceAlpha" result="alpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="-2.5" dy="-2.5" result="offsetBlur"/>
          <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood floodColor="white" floodOpacity="0.75"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over" result="highlight"/>
        </filter>
      </defs>
      <style>{`
        .rom-anim-float { animation: rom-float 3s ease-in-out infinite; }
        @keyframes rom-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
      <g className="rom-anim-float" filter="url(#clay-3d-rom)">
        <g transform="translate(50, 50) scale(0.9) rotate(5)">
          <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="closed" blush={true} />
        </g>
        <g transform="translate(90, 50) scale(0.9) rotate(-5)">
          <BearFace color="#d4a373" ears="#a98467" eyeType="closed" blush={true} />
        </g>
        <path d="M 85 110 Q 100 110 100 125 Q 100 140 85 140 Q 70 140 70 125 Q 70 110 85 110" fill="#f43f5e" />
      </g>
    </svg>
);

export const BubuDuduNight = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl pb-4 overflow-visible">
      <defs>
        <filter id="clay-3d-night" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3" result="shadow"/>
          <feComponentTransfer in="SourceAlpha" result="alpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="-2.5" dy="-2.5" result="offsetBlur"/>
          <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood floodColor="white" floodOpacity="0.5"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over" result="highlight"/>
        </filter>
      </defs>
      <style>{`
        .night-anim-float { animation: night-float 4s ease-in-out infinite; }
        @keyframes night-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
      <g filter="url(#clay-3d-night)">
        <path d="M 150 40 A 20 20 0 1 0 170 20 A 25 25 0 0 1 150 40 Z" fill="#fde047" />
        <circle cx="40" cy="30" r="2" fill="#fff" opacity="0.8" />
        <circle cx="80" cy="20" r="1.5" fill="#fff" opacity="0.6" />
        <circle cx="120" cy="40" r="2" fill="#fff" opacity="0.9" />
      </g>
      <g className="night-anim-float" filter="url(#clay-3d-night)">
        <g transform="translate(45, 60) scale(0.85)">
          <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="sleepy" blush={true} />
        </g>
        <g transform="translate(95, 60) scale(0.85)">
          <BearFace color="#d4a373" ears="#a98467" eyeType="sleepy" blush={true} />
        </g>
      </g>
    </svg>
);

export const BubuDuduGalaxy = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl pb-4 overflow-visible">
      <defs>
        <filter id="clay-3d-galaxy" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.4" result="shadow"/>
          <feComponentTransfer in="SourceAlpha" result="alpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="-2.5" dy="-2.5" result="offsetBlur"/>
          <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood floodColor="white" floodOpacity="0.6"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over" result="highlight"/>
        </filter>
      </defs>
      <style>{`
        .galaxy-anim-spin { animation: galaxy-spin 10s linear infinite; transform-origin: center; }
        .galaxy-anim-float { animation: galaxy-float 3s ease-in-out infinite; }
        @keyframes galaxy-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes galaxy-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      `}</style>
      <g filter="url(#clay-3d-galaxy)">
        <ellipse cx="100" cy="80" rx="70" ry="20" fill="none" stroke="#c084fc" strokeWidth="4" transform="rotate(-15 100 80)" />
        <circle cx="160" cy="30" r="10" fill="#f472b6" />
        <circle cx="30" cy="110" r="15" fill="#38bdf8" />
      </g>
      <g className="galaxy-anim-float" filter="url(#clay-3d-galaxy)">
        <g transform="translate(50, 40) scale(0.8)">
          <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="open" blush={true} />
          {/* Astronaut helmet */}
          <circle cx="50" cy="45" r="45" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
        </g>
        <g transform="translate(100, 50) scale(0.8)">
          <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
          <circle cx="50" cy="45" r="45" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
        </g>
      </g>
    </svg>
);

export const BubuDuduForest = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl pb-4 overflow-visible">
      <defs>
        <filter id="clay-3d-forest" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" result="shadow"/>
          <feComponentTransfer in="SourceAlpha" result="alpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="-2.5" dy="-2.5" result="offsetBlur"/>
          <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood floodColor="white" floodOpacity="0.75"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over" result="highlight"/>
        </filter>
      </defs>
      <style>{`
        .forest-anim-float { animation: forest-float 3.5s ease-in-out infinite; }
        @keyframes forest-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
      <g filter="url(#clay-3d-forest)">
        {/* Trees */}
        <polygon points="30,40 10,80 50,80" fill="#22c55e" />
        <rect x="25" y="80" width="10" height="15" fill="#78350f" />
        <polygon points="170,30 145,85 195,85" fill="#16a34a" />
        <rect x="165" y="85" width="10" height="15" fill="#78350f" />
      </g>
      <g className="forest-anim-float" filter="url(#clay-3d-forest)">
        <g transform="translate(45, 55) scale(0.9)">
          <BearFace color="#f8f9fa" ears="#e9ecef" eyeType="open" blush={true} />
          {/* Flower on head */}
          <circle cx="50" cy="-5" r="5" fill="#fcd34d" />
          <circle cx="43" cy="-5" r="4" fill="#f472b6" />
          <circle cx="57" cy="-5" r="4" fill="#f472b6" />
          <circle cx="50" cy="-12" r="4" fill="#f472b6" />
          <circle cx="50" cy="2" r="4" fill="#f472b6" />
        </g>
        <g transform="translate(95, 55) scale(0.9)">
          <BearFace color="#d4a373" ears="#a98467" eyeType="open" blush={true} />
          {/* Leaf on head */}
          <path d="M 50 -5 Q 60 -15 65 -5 Q 55 5 50 -5" fill="#4ade80" />
        </g>
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
    case 'romantic': return <BubuDuduRomantic />;
    case 'night': return <BubuDuduNight />;
    case 'galaxy': return <BubuDuduGalaxy />;
    case 'forest': return <BubuDuduForest />;
    default: return <BubuDuduParty />;
  }
}

export const PhotoCake = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full rounded-lg overflow-hidden bg-linear-to-br from-yellow-50 to-orange-100 shadow-inner">
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
    <svg viewBox="0 0 200 150" className="w-full h-full rounded-lg overflow-hidden bg-linear-to-br from-pink-50 to-rose-100 shadow-inner">
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
    <svg viewBox="0 0 200 150" className="w-full h-full rounded-lg overflow-hidden bg-linear-to-br from-indigo-100 to-purple-200 shadow-inner">
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
