import React, { useEffect, useState } from 'react';

// Animated Bubu & Dudu running with cake — pure CSS 3D animation
export default function BubuDuduRunningAnimation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="bd-scene" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 1.2s ease' }}>
      <style>{`
        .bd-scene {
          position: relative;
          width: 100%;
          height: 100%;
          pointer-events: none;
          perspective: 1200px;
          overflow: visible;
        }

        /* ---- Floating particles ---- */
        .bd-particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
          animation: bdFloatUp 6s ease-in-out infinite;
        }
        @keyframes bdFloatUp {
          0% { opacity: 0; transform: translateY(0) scale(0.5) rotate(0deg); }
          20% { opacity: 0.6; }
          80% { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-80px) scale(1.1) rotate(360deg); }
        }

        /* ---- Hearts floating ---- */
        .bd-heart {
          position: absolute;
          opacity: 0;
          animation: bdHeartFloat 7s ease-in-out infinite;
        }
        @keyframes bdHeartFloat {
          0% { opacity: 0; transform: translateY(0) scale(0.4) rotate(-10deg); }
          15% { opacity: 0.5; }
          50% { opacity: 0.7; transform: translateY(-60px) scale(0.9) rotate(10deg); }
          85% { opacity: 0.2; }
          100% { opacity: 0; transform: translateY(-120px) scale(0.5) rotate(-15deg); }
        }

        /* ---- Sparkle stars ---- */
        .bd-sparkle {
          position: absolute;
          opacity: 0;
          animation: bdSparklePulse 3s ease-in-out infinite;
        }
        @keyframes bdSparklePulse {
          0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(1) rotate(180deg); }
        }

        /* ---- Confetti pieces ---- */
        .bd-confetti {
          position: absolute;
          opacity: 0;
          animation: bdConfettiFall 5s linear infinite;
        }
        @keyframes bdConfettiFall {
          0% { opacity: 0; transform: translateY(-20px) rotate(0deg) scale(0.5); }
          10% { opacity: 0.8; }
          90% { opacity: 0.5; }
          100% { opacity: 0; transform: translateY(140px) rotate(720deg) scale(0.3); }
        }

        /* ---- Running group container ---- */
        .bd-run-track {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bdRunAcross 12s linear infinite;
        }
        @keyframes bdRunAcross {
          0% { transform: translateX(-5%); }
          50% { transform: translateX(5%); }
          100% { transform: translateX(-5%); }
        }

        /* ---- 3D scene container ---- */
        .bd-scene-3d {
          transform-style: preserve-3d;
          animation: bdSceneSway 8s ease-in-out infinite;
          display: flex;
          align-items: flex-end;
          gap: 0;
        }
        @keyframes bdSceneSway {
          0%, 100% { transform: rotateY(-3deg) rotateX(2deg); }
          25% { transform: rotateY(2deg) rotateX(-1deg); }
          50% { transform: rotateY(3deg) rotateX(2deg); }
          75% { transform: rotateY(-2deg) rotateX(-1deg); }
        }

        /* ---- Whole group gentle bounce ---- */
        .bd-group-bounce {
          animation: bdGroupBounce 2.5s ease-in-out infinite;
          display: flex;
          align-items: flex-end;
          gap: 0;
        }
        @keyframes bdGroupBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* ---- Individual bear running bounce ---- */
        .bd-bear {
          position: relative;
          animation: bdBearBounce 0.5s ease-in-out infinite;
        }
        .bd-bear-bubu {
          animation-delay: 0s;
          margin-right: -8px;
          z-index: 3;
        }
        .bd-bear-dudu {
          animation-delay: 0.25s;
          margin-left: -8px;
          z-index: 3;
        }
        @keyframes bdBearBounce {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
        }

        /* ---- Cake wobble ---- */
        .bd-cake {
          position: relative;
          animation: bdCakeWobble 1s ease-in-out infinite;
          z-index: 5;
          margin: 0 -6px;
          align-self: flex-end;
          margin-bottom: 12px;
        }
        @keyframes bdCakeWobble {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-6px) rotate(3deg); }
          50% { transform: translateY(-3px) rotate(-2deg); }
          75% { transform: translateY(-8px) rotate(1deg); }
        }

        /* ---- Candle flame glow ---- */
        .bd-flame {
          animation: bdFlameGlow 0.35s ease-in-out infinite alternate;
        }
        @keyframes bdFlameGlow {
          0% { filter: drop-shadow(0 0 4px #fbbf24) drop-shadow(0 0 8px #f59e0b); opacity: 0.85; }
          100% { filter: drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 16px #f59e0b); opacity: 1; }
        }

        /* ---- Pulsing shadow under characters ---- */
        .bd-shadow {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 10px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: bdShadowPulse 0.5s ease-in-out infinite;
        }
        .bd-shadow-b { animation-delay: 0s; }
        .bd-shadow-d { animation-delay: 0.25s; }
        @keyframes bdShadowPulse {
          0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.5; }
          50% { transform: translateX(-50%) scaleX(0.6); opacity: 0.15; }
        }

        /* ---- Music / emoji float ---- */
        .bd-emoji {
          position: absolute;
          opacity: 0;
          animation: bdEmojiFloat 3s ease-in-out infinite;
        }
        @keyframes bdEmojiFloat {
          0% { opacity: 0; transform: translate(0, 0) rotate(0deg) scale(0.6); }
          20% { opacity: 0.9; transform: scale(1); }
          100% { opacity: 0; transform: translate(18px, -55px) rotate(25deg) scale(0.7); }
        }

        /* ---- Speed lines ---- */
        .bd-speed {
          position: absolute;
          height: 2px;
          border-radius: 999px;
          opacity: 0;
          animation: bdSpeedDash 1.2s ease-out infinite;
        }
        @keyframes bdSpeedDash {
          0% { opacity: 0; transform: scaleX(0); }
          30% { opacity: 0.35; }
          100% { opacity: 0; transform: scaleX(1) translateX(-50px); }
        }

        /* ---- Footprint trail ---- */
        .bd-footprint {
          position: absolute;
          width: 7px;
          height: 11px;
          border-radius: 50% 50% 40% 40%;
          background: rgba(244, 114, 182, 0.12);
          animation: bdFootFade 2s ease-out infinite;
        }
        @keyframes bdFootFade {
          0% { opacity: 0.4; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.5); }
        }

        /* ---- Dust cloud behind runners ---- */
        .bd-dust {
          position: absolute;
          border-radius: 50%;
          background: rgba(244, 114, 182, 0.08);
          opacity: 0;
          animation: bdDustPuff 1.5s ease-out infinite;
        }
        @keyframes bdDustPuff {
          0% { opacity: 0; transform: scale(0.3); }
          20% { opacity: 0.3; }
          100% { opacity: 0; transform: scale(2) translateX(-30px); }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .bd-run-track {
            transform: scale(0.65);
          }
          @keyframes bdRunAcross {
            0% { transform: translateX(-3%) scale(0.65); }
            50% { transform: translateX(3%) scale(0.65); }
            100% { transform: translateX(-3%) scale(0.65); }
          }
        }
        @media (max-width: 480px) {
          .bd-run-track {
            transform: scale(0.5);
          }
          @keyframes bdRunAcross {
            0% { transform: translateX(-2%) scale(0.5); }
            50% { transform: translateX(2%) scale(0.5); }
            100% { transform: translateX(-2%) scale(0.5); }
          }
        }
      `}</style>

      {/* Background particles */}
      {[...Array(14)].map((_, i) => (
        <div
          key={`p${i}`}
          className="bd-particle"
          style={{
            width: 4 + (i % 4) * 2,
            height: 4 + (i % 4) * 2,
            left: `${(i * 7 + 3) % 95}%`,
            top: `${(i * 13 + 5) % 70}%`,
            background: ['#f472b6', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa', '#fb7185', '#f59e0b'][i % 7],
            animationDelay: `${i * 0.45}s`,
            animationDuration: `${4.5 + (i % 3)}s`,
          }}
        />
      ))}

      {/* Floating hearts */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`h${i}`}
          className="bd-heart"
          style={{
            left: `${(i * 12 + 5) % 92}%`,
            top: `${20 + (i * 9) % 50}%`,
            animationDelay: `${i * 1.0}s`,
            fontSize: 14 + (i % 3) * 5,
            color: ['#f472b6', '#fb7185', '#f43f5e', '#fda4af', '#ec4899', '#be185d', '#fca5a5', '#f9a8d4'][i],
          }}
        >
          ♥
        </div>
      ))}

      {/* Sparkle stars */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`s${i}`}
          className="bd-sparkle"
          style={{
            left: `${(i * 10 + 2) % 95}%`,
            top: `${(i * 8 + 3) % 65}%`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${2.2 + (i % 3) * 0.6}s`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M7 0 L8.5 5 L14 7 L8.5 9 L7 14 L5.5 9 L0 7 L5.5 5 Z" fill="#fbbf24" opacity="0.6" />
          </svg>
        </div>
      ))}

      {/* Confetti */}
      {[...Array(18)].map((_, i) => (
        <div
          key={`c${i}`}
          className="bd-confetti"
          style={{
            left: `${(i * 5.5 + 1) % 98}%`,
            top: `${-5 + (i * 3) % 20}%`,
            background: ['#f472b6', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa', '#fb7185', '#f59e0b', '#10b981'][i % 8],
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
            width: 5 + (i % 3) * 2,
            height: 5 + (i % 3) * 2,
            animationDelay: `${i * 0.28}s`,
            animationDuration: `${3.5 + (i % 4) * 0.8}s`,
          }}
        />
      ))}

      {/* ===== MAIN RUNNING CHARACTERS ===== */}
      <div className="bd-run-track">
        <div className="bd-scene-3d">
          <div className="bd-group-bounce">

            {/* Speed lines behind the group */}
            {[...Array(5)].map((_, i) => (
              <div
                key={`sl${i}`}
                className="bd-speed"
                style={{
                  position: 'absolute',
                  left: -35 - i * 14,
                  top: `${25 + i * 16}%`,
                  width: 28 + (i % 3) * 10,
                  background: `linear-gradient(to left, rgba(244,114,182,${0.25 - i * 0.04}), transparent)`,
                  animationDelay: `${i * 0.25}s`,
                }}
              />
            ))}

            {/* Dust clouds behind runners */}
            {[...Array(4)].map((_, i) => (
              <div
                key={`d${i}`}
                className="bd-dust"
                style={{
                  position: 'absolute',
                  left: -20 - i * 18,
                  bottom: 5 + i * 12,
                  width: 16 + i * 4,
                  height: 16 + i * 4,
                  animationDelay: `${i * 0.35}s`,
                }}
              />
            ))}

            {/* ======= BUBU (White Bear) ======= */}
            <div className="bd-bear bd-bear-bubu">
              <div className="bd-shadow bd-shadow-b" />
              <svg viewBox="-5 -25 110 150" width="130" height="175" style={{ filter: 'drop-shadow(0 6px 20px rgba(244,114,182,0.2))' }}>
                {/* Body */}
                <ellipse cx="50" cy="88" rx="30" ry="27" fill="#f8f9fa" />
                {/* Arm Left */}
                <ellipse cx="20" cy="78" rx="11" ry="15" fill="#f0f0f0" transform="rotate(15 20 78)" />
                {/* Arm Right (waving) */}
                <ellipse cx="80" cy="70" rx="11" ry="15" fill="#f0f0f0" transform="rotate(-20 80 70)">
                  <animateTransform attributeName="transform" type="rotate" values="-20 80 70;-38 80 70;-20 80 70" dur="0.7s" repeatCount="indefinite" />
                </ellipse>
                {/* Left Leg */}
                <ellipse cx="36" cy="112" rx="11" ry="9" fill="#e9ecef">
                  <animateTransform attributeName="transform" type="rotate" values="15 36 112;-15 36 112;15 36 112" dur="0.5s" repeatCount="indefinite" />
                </ellipse>
                {/* Right Leg */}
                <ellipse cx="64" cy="112" rx="11" ry="9" fill="#e9ecef">
                  <animateTransform attributeName="transform" type="rotate" values="-15 64 112;15 64 112;-15 64 112" dur="0.5s" repeatCount="indefinite" />
                </ellipse>
                {/* Head */}
                <circle cx="50" cy="42" r="32" fill="#f8f9fa" />
                {/* Ears */}
                <circle cx="23" cy="18" r="13" fill="#e9ecef" />
                <circle cx="77" cy="18" r="13" fill="#e9ecef" />
                <circle cx="23" cy="18" r="7" fill="#fecdd3" opacity="0.6" />
                <circle cx="77" cy="18" r="7" fill="#fecdd3" opacity="0.6" />
                {/* Eyes - happy closed */}
                <path d="M 35 38 Q 41 32 47 38" fill="none" stroke="#3f3f46" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 53 38 Q 59 32 65 38" fill="none" stroke="#3f3f46" strokeWidth="2.5" strokeLinecap="round" />
                {/* Nose */}
                <circle cx="50" cy="45" r="3.5" fill="#3f3f46" />
                {/* Mouth */}
                <path d="M 43 49 Q 50 56 57 49" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" />
                {/* Blush */}
                <ellipse cx="30" cy="47" rx="8" ry="4.5" fill="#fecdd3" opacity="0.8" />
                <ellipse cx="70" cy="47" rx="8" ry="4.5" fill="#fecdd3" opacity="0.8" />
                {/* Party hat */}
                <polygon points="33,12 67,12 50,-18" fill="#f472b6" />
                <circle cx="50" cy="-18" r="6" fill="#fcd34d" />
                <circle cx="44" cy="0" r="3" fill="#fff" opacity="0.5" />
                <circle cx="56" cy="3" r="3" fill="#fff" opacity="0.5" />
                <circle cx="50" cy="-7" r="2.5" fill="#60a5fa" opacity="0.6" />
              </svg>
              {/* Floating emojis */}
              <div className="bd-emoji" style={{ top: 5, right: 12, animationDelay: '0s', fontSize: 20 }}>🎵</div>
              <div className="bd-emoji" style={{ top: 20, right: -2, animationDelay: '1.5s', fontSize: 18 }}>🎶</div>
            </div>

            {/* ======= CAKE ======= */}
            <div className="bd-cake">
              <svg viewBox="-5 -20 90 115" width="100" height="125" style={{ filter: 'drop-shadow(0 6px 20px rgba(251,191,36,0.35))' }}>
                {/* Plate */}
                <ellipse cx="40" cy="82" rx="42" ry="11" fill="#e2e8f0" />
                <ellipse cx="40" cy="84" rx="38" ry="9" fill="#cbd5e1" opacity="0.4" />
                {/* Base Layer */}
                <rect x="5" y="56" width="70" height="25" fill="#fcd34d" rx="5" />
                {/* Middle layer */}
                <rect x="10" y="38" width="60" height="19" fill="#fbbf24" rx="4" />
                {/* Top layer */}
                <rect x="16" y="24" width="48" height="15" fill="#fde68a" rx="3" />
                {/* Frosting drips bottom */}
                <path d="M 5 56 Q 13 64 21 56 T 37 56 T 53 56 T 69 56 T 75 56" fill="none" stroke="#fb7185" strokeWidth="6" strokeLinecap="round" />
                <circle cx="10" cy="62" r="4.5" fill="#fb7185" />
                <circle cx="24" cy="64" r="5" fill="#fb7185" />
                <circle cx="40" cy="63" r="4.5" fill="#fb7185" />
                <circle cx="56" cy="64" r="5" fill="#fb7185" />
                <circle cx="70" cy="62" r="4" fill="#fb7185" />
                {/* Frosting between layers */}
                <path d="M 10 38 Q 18 45 26 38 T 42 38 T 58 38 T 70 38" fill="none" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" />
                {/* Sprinkles */}
                <line x1="18" y1="48" x2="21" y2="44" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                <line x1="33" y1="50" x2="36" y2="46" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                <line x1="50" y1="48" x2="53" y2="44" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                <line x1="62" y1="50" x2="65" y2="46" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
                <line x1="26" y1="66" x2="29" y2="62" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                <line x1="48" y1="68" x2="51" y2="64" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
                {/* Candle 1 */}
                <rect x="22" y="6" width="6" height="19" fill="#fff" rx="2" />
                <rect x="22" y="6" width="6" height="19" fill="url(#bdStripe1)" rx="2" />
                <g className="bd-flame">
                  <ellipse cx="25" cy="3" rx="4.5" ry="7" fill="#f59e0b" opacity="0.9" />
                  <ellipse cx="25" cy="1" rx="3" ry="4.5" fill="#fcd34d" />
                  <ellipse cx="25" cy="-1" rx="1.5" ry="2.5" fill="#fff" opacity="0.7" />
                </g>
                {/* Candle 2 (taller center) */}
                <rect x="37" y="2" width="6" height="23" fill="#fff" rx="2" />
                <rect x="37" y="2" width="6" height="23" fill="url(#bdStripe2)" rx="2" />
                <g className="bd-flame" style={{ animationDelay: '0.18s' }}>
                  <ellipse cx="40" cy="-1" rx="4.5" ry="7" fill="#f59e0b" opacity="0.9" />
                  <ellipse cx="40" cy="-3" rx="3" ry="4.5" fill="#fcd34d" />
                  <ellipse cx="40" cy="-5" rx="1.5" ry="2.5" fill="#fff" opacity="0.7" />
                </g>
                {/* Candle 3 */}
                <rect x="52" y="6" width="6" height="19" fill="#fff" rx="2" />
                <rect x="52" y="6" width="6" height="19" fill="url(#bdStripe3)" rx="2" />
                <g className="bd-flame" style={{ animationDelay: '0.12s' }}>
                  <ellipse cx="55" cy="3" rx="4.5" ry="7" fill="#f59e0b" opacity="0.9" />
                  <ellipse cx="55" cy="1" rx="3" ry="4.5" fill="#fcd34d" />
                  <ellipse cx="55" cy="-1" rx="1.5" ry="2.5" fill="#fff" opacity="0.7" />
                </g>
                {/* Candle stripe defs */}
                <defs>
                  <pattern id="bdStripe1" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                    <rect width="6" height="3" fill="#f472b6" opacity="0.45" />
                  </pattern>
                  <pattern id="bdStripe2" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                    <rect width="6" height="3" fill="#60a5fa" opacity="0.45" />
                  </pattern>
                  <pattern id="bdStripe3" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                    <rect width="6" height="3" fill="#34d399" opacity="0.45" />
                  </pattern>
                </defs>
                {/* Cherry */}
                <circle cx="40" cy="-5" r="4.5" fill="#ef4444" />
                <path d="M 40 -5 Q 43 -14 48 -16" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                <ellipse cx="48" cy="-17" rx="3.5" ry="2" fill="#22c55e" />
              </svg>
            </div>

            {/* ======= DUDU (Brown Bear) ======= */}
            <div className="bd-bear bd-bear-dudu">
              <div className="bd-shadow bd-shadow-d" />
              <svg viewBox="-5 -25 110 150" width="130" height="175" style={{ filter: 'drop-shadow(0 6px 20px rgba(212,163,115,0.2))' }}>
                {/* Body */}
                <ellipse cx="50" cy="88" rx="30" ry="27" fill="#d4a373" />
                {/* Arm Left (reaching for cake) */}
                <ellipse cx="20" cy="74" rx="11" ry="15" fill="#c49360" transform="rotate(20 20 74)">
                  <animateTransform attributeName="transform" type="rotate" values="20 20 74;5 20 74;20 20 74" dur="0.7s" repeatCount="indefinite" />
                </ellipse>
                {/* Arm Right */}
                <ellipse cx="80" cy="78" rx="11" ry="15" fill="#c49360" transform="rotate(-15 80 78)" />
                {/* Left Leg */}
                <ellipse cx="36" cy="112" rx="11" ry="9" fill="#a98467">
                  <animateTransform attributeName="transform" type="rotate" values="-15 36 112;15 36 112;-15 36 112" dur="0.5s" repeatCount="indefinite" />
                </ellipse>
                {/* Right Leg */}
                <ellipse cx="64" cy="112" rx="11" ry="9" fill="#a98467">
                  <animateTransform attributeName="transform" type="rotate" values="15 64 112;-15 64 112;15 64 112" dur="0.5s" repeatCount="indefinite" />
                </ellipse>
                {/* Head */}
                <circle cx="50" cy="42" r="32" fill="#d4a373" />
                {/* Ears */}
                <circle cx="23" cy="18" r="13" fill="#a98467" />
                <circle cx="77" cy="18" r="13" fill="#a98467" />
                <circle cx="23" cy="18" r="7" fill="#fecdd3" opacity="0.6" />
                <circle cx="77" cy="18" r="7" fill="#fecdd3" opacity="0.6" />
                {/* Eyes - open excited */}
                <circle cx="38" cy="37" r="5.5" fill="#3f3f46" />
                <circle cx="62" cy="37" r="5.5" fill="#3f3f46" />
                <circle cx="36" cy="35" r="2.2" fill="white" />
                <circle cx="60" cy="35" r="2.2" fill="white" />
                <circle cx="40" cy="38" r="1" fill="white" opacity="0.8" />
                <circle cx="64" cy="38" r="1" fill="white" opacity="0.8" />
                {/* Nose */}
                <circle cx="50" cy="45" r="3.5" fill="#3f3f46" />
                {/* Big smile open mouth */}
                <path d="M 39 50 Q 50 61 61 50" fill="#3f3f46" />
                <path d="M 41 50 Q 50 58 59 50" fill="#fb7185" />
                {/* Tongue */}
                <ellipse cx="50" cy="54" rx="4.5" ry="3.5" fill="#f472b6" />
                {/* Blush */}
                <ellipse cx="28" cy="47" rx="8" ry="4.5" fill="#fecdd3" opacity="0.8" />
                <ellipse cx="72" cy="47" rx="8" ry="4.5" fill="#fecdd3" opacity="0.8" />
                {/* Party hat */}
                <polygon points="33,12 67,12 50,-18" fill="#60a5fa" />
                <circle cx="50" cy="-18" r="6" fill="#fcd34d" />
                <circle cx="43" cy="0" r="3" fill="#fff" opacity="0.5" />
                <circle cx="57" cy="3" r="3" fill="#fff" opacity="0.5" />
                <circle cx="50" cy="-7" r="2.5" fill="#f472b6" opacity="0.6" />
              </svg>
              {/* Floating emojis */}
              <div className="bd-emoji" style={{ top: 8, left: 12, animationDelay: '0.6s', fontSize: 18 }}>✨</div>
              <div className="bd-emoji" style={{ top: 25, left: -3, animationDelay: '2.2s', fontSize: 16 }}>🎂</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footprint trail */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`fp${i}`}
          className="bd-footprint"
          style={{
            bottom: '12%',
            left: `${25 + i * 4.5}%`,
            animationDelay: `${i * 0.25}s`,
            transform: `rotate(${i % 2 === 0 ? -8 : 8}deg)`,
          }}
        />
      ))}
    </div>
  );
}
