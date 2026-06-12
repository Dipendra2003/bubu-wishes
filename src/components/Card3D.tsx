import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import confetti from 'canvas-confetti';
import { CardData, MusicType } from '../types';
import { ThemeIcon, ThemeColors, SurprisePhotoIcon } from './ThemeGraphics';
import { playTune, stopTune, playPageTurnSound, playTypewriterSound } from '../lib/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Share, RefreshCw, Play, Pause, SkipForward, SkipBack, Music, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { FloatingBalloons } from './FloatingBalloons';

interface Card3DProps {
  data: CardData;
  onEdit?: () => void;
  isEditorPreview?: boolean;
}

const MUSIC_TRACKS: { id: Exclude<MusicType, 'none' | 'custom'>; label: string }[] = [
  { id: 'happy_birthday', label: 'Happy Birthday' },
  { id: 'cute_bounce', label: 'Cute Bounce' },
  { id: 'mellow', label: 'Mellow Tune' }
];

export function Card3D({ data, onEdit, isEditorPreview = false }: Card3DProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isTypingActive, setIsTypingActive] = useState(false);
  
  const customPhotos = data.customPhotoUrls && data.customPhotoUrls.length > 0 
    ? data.customPhotoUrls 
    : (data.customPhotoUrl ? [data.customPhotoUrl] : []);
  const tracks = React.useMemo(() => {
    const list: { id: string; label: string; url?: string }[] = [...MUSIC_TRACKS];
    if (data.music === 'custom' && data.customMusicUrl) {
      list.push({ id: 'custom', label: 'Custom Song', url: data.customMusicUrl });
    }
    return list;
  }, [data.music, data.customMusicUrl]);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const idx = tracks.findIndex(t => t.id === data.music);
    return Math.max(0, idx);
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const voiceAudioRef = useRef<HTMLAudioElement>(null);
  const playPromiseRef = useRef<Promise<void> | undefined>(undefined);

  // --- Gesture State (Pinch to Zoom & Rotate) ---
  const [gesture, setGesture] = useState({ scale: 1, rotate: 0 });
  const initialGestureRef = useRef<{ dist: number; angle: number; startScale: number; startRotate: number } | null>(null);

  const getPinchInfo = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return { dist, angle };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const info = getPinchInfo(e.touches);
      initialGestureRef.current = {
        dist: info.dist,
        angle: info.angle,
        startScale: gesture.scale,
        startRotate: gesture.rotate
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialGestureRef.current) {
      const info = getPinchInfo(e.touches);
      const newScale = Math.min(Math.max(0.5, initialGestureRef.current.startScale * (info.dist / initialGestureRef.current.dist)), 3);
      
      let angleDiff = info.angle - initialGestureRef.current.angle;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      const newRotate = initialGestureRef.current.startRotate + angleDiff;
      setGesture({ scale: newScale, rotate: newRotate });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialGestureRef.current = null;
    }
  };
  // ----------------------------------------------

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const isCustomAudio = tracks[currentTrackIndex]?.id === 'custom';
    const originalUrl = tracks[currentTrackIndex]?.url || '';
    const isReactPlayerUrl = isCustomAudio && (originalUrl.includes('youtube.com') || originalUrl.includes('youtu.be'));
    
    // Calculate what the src should be: any audio that is not youtube
    const targetSrc = !isReactPlayerUrl ? originalUrl : '';
    const shouldPlay = isPlaying && !!targetSrc;

    // Helper to safely pause and clear src
    const safelyPause = () => {
      const p = playPromiseRef.current;
      if (p !== undefined) {
        p.then(() => {
          audio.pause();
        }).catch(() => {
          // Play failed, no need to pause
        }).finally(() => {
           if (playPromiseRef.current === p) {
              playPromiseRef.current = undefined;
           }
        });
      } else {
        audio.pause();
      }
    };

    if (shouldPlay) {
      if (audio.getAttribute('src') !== targetSrc) {
         safelyPause();
         audio.setAttribute('src', targetSrc);
         audio.load();
      }
      playPromiseRef.current = audio.play();
      if (playPromiseRef.current !== undefined) {
        playPromiseRef.current.catch(e => {
          if (e.name !== 'AbortError' && e.name !== 'NotAllowedError' && e.name !== 'NotSupportedError') {
             console.warn("Audio play prevented:", e);
          }
        });
      }
    } else {
      safelyPause();
    }
  }, [isPlaying, tracks, currentTrackIndex]);

  useEffect(() => {
    const idx = tracks.findIndex(t => t.id === data.music);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    }
  }, [data.music, data.customMusicUrl, tracks]);

  const colors = ThemeColors[data.theme] || ThemeColors.party;
  
  const fontClass = data.fontFamily === 'sans' ? 'font-sans' :
                    data.fontFamily === 'serif' ? 'font-serif' :
                    data.fontFamily === 'dancing' ? 'font-dancing' :
                    data.fontFamily === 'pacifico' ? 'font-pacifico' :
                    'font-handwriting';

  useEffect(() => {
    if (isOpen) {
      if (data.music !== 'none' && tracks.length > 0) {
        const startIdx = tracks.findIndex(t => t.id === data.music);
        const activeIdx = Math.max(0, startIdx);
        setCurrentTrackIndex(activeIdx);
        const track = tracks[activeIdx];
        if (track) {
          playTune(track.id, track.url);
          setIsPlaying(true);
        }
      }
      
      if (voiceAudioRef.current) {
        voiceAudioRef.current.currentTime = 0;
        voiceAudioRef.current.play().catch(e => console.warn("Voice play prevented:", e));
      }

      if (data.theme === 'party') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f472b6', '#60a5fa', '#34d399']
          });
        }, 300);
      }
      
      // typing should start as card opens
      const typingTimeout = setTimeout(() => {
        setIsTypingActive(true);
      }, 500);
      
      return () => clearTimeout(typingTimeout);
    } else {
      setIsTypingActive(false);
      stopTune();
      setIsPlaying(false);
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const togglePlayPause = () => {
    if (isPlaying) {
      stopTune();
      setIsPlaying(false);
    } else if (tracks.length > 0) {
      const track = tracks[currentTrackIndex];
      if (track) {
        playTune(track.id, track.url);
        setIsPlaying(true);
      }
    }
  };

  const skipTrack = (direction: number) => {
    if (tracks.length === 0) return;
    const nextIndex = (currentTrackIndex + direction + tracks.length) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    if (isPlaying) {
      const track = tracks[nextIndex];
      if (track) playTune(track.id, track.url);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full flex-1 py-12 px-4 overflow-hidden bg-transparent">
      
      {/* Floating Music Player */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[60] bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg rounded-xl sm:rounded-2xl flex flex-col items-center p-2 sm:p-3 gap-1.5 sm:gap-2 scale-90 sm:scale-100 origin-top-right transform-gpu"
          >
            <div className="flex items-center gap-1 sm:gap-2 text-pink-600">
              <Music className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-bold font-sans uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px] sm:max-w-[120px]">
                {tracks[currentTrackIndex]?.label || ''}
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 bg-white/40 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/50">
              <button 
                onClick={(e) => { e.stopPropagation(); skipTrack(-1); }}
                className="text-gray-500 hover:text-pink-500 transition-colors focus:outline-none"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                className="text-pink-500 hover:text-pink-600 transition-transform hover:scale-110 focus:outline-none drop-shadow-md"
              >
                {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); skipTrack(1); }}
                className="text-gray-500 hover:text-pink-500 transition-colors focus:outline-none"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Gesture Container holding the card for pinch & zoom */}
      <div
         className="relative flex items-center justify-center pointer-events-auto z-10"
         style={{
           transform: `scale(${gesture.scale}) rotateZ(${gesture.rotate}deg)`,
           touchAction: 'none',
           transition: initialGestureRef.current ? 'none' : 'transform 0.3s ease-out'
         }}
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
         onTouchCancel={handleTouchEnd}
      >
        <div 
          className={cn(
            "perspective-2000 w-[260px] h-[360px] sm:w-[320px] sm:h-[420px] md:w-[384px] md:h-[480px] lg:w-[420px] lg:h-[540px] cursor-pointer group flex-shrink-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]",
            isOpen ? "translate-x-[27.5%] sm:translate-x-[37.5%] md:translate-x-[45%] lg:translate-x-[50%] scale-[0.55] sm:scale-[0.75] md:scale-90 lg:scale-100" : "translate-x-0 scale-[0.85] sm:scale-100"
          )}
          onClick={() => {
            setIsOpen(!isOpen);
            playPageTurnSound();
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={cn(
            "relative w-full h-full transform-style-3d transition-transform duration-1000 ease-out",
            !isOpen && isHovered ? "rotate-y-[-10deg] rotate-x-[5deg]" : "",
            isOpen && isHovered ? "rotate-y-[-5deg] rotate-x-[2deg] translate-z-10" : ""
          )}>
          
          {/* Base: Right Side of the inner card and actual back cover */}
          <div className={cn(
            "absolute inset-0 shadow-2xl rounded-2xl transform-style-3d overflow-hidden",
            colors.cardInside
          )}>
            {/* Back Cover (What you see when card is fully closed from back, not important here as we only see from front) */}
            
            {/* Inside Right */}
            <div className="absolute inset-0 flex flex-col p-6 md:p-8 items-center backface-hidden justify-center text-center">
               <h2 className={cn(fontClass, "text-3xl md:text-4xl font-bold mb-4 md:mb-6", colors.text)}>
                 Dear {data.to || 'Friend'},
               </h2>
               <div className="flex-1 w-full overflow-y-auto mb-4 custom-scrollbar">
                 <p className={cn(fontClass, "text-2xl md:text-3xl whitespace-pre-wrap leading-relaxed", colors.text)}>
                   <TypewriterText text={data.message || 'Hoping you have a wonderful day!'} active={isTypingActive} />
                 </p>
               </div>
               <p className={cn(fontClass, "text-2xl md:text-3xl font-medium mt-auto transition-opacity duration-[2000ms]", isTypingActive ? "opacity-100 delay-[2000ms]" : "opacity-0", colors.text)}>
                 Love, {data.from || 'Me'}
               </p>
            </div>
          </div>
          
          {/* Cover: Left Side of the inner card and actual front cover */}
          <div 
            className={cn(
              "absolute inset-0 origin-left transition-transform duration-[1500ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] transform-style-3d z-10",
              isOpen ? "-rotate-y-160" : "rotate-y-0"
            )}
            style={{ transformOrigin: 'left center' }}
          >
            {/* Front Cover */}
            <div 
              className={cn(
                "absolute inset-0 backface-hidden shadow-xl rounded-2xl flex flex-col items-center justify-between p-6 overflow-hidden",
                data.cardColor && !data.cardColor.startsWith('#') ? data.cardColor : (!data.cardColor ? colors.cardOutside : "")
              )}
              style={data.cardColor?.startsWith('#') ? { backgroundColor: data.cardColor } : undefined}
            >
               <FloatingBalloons isActive={!isOpen} effectType={data.floatingEffect} />
               <div className="mt-8 text-center relative z-10 pointer-events-none">
                 <motion.h1 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn("font-serif text-3xl md:text-4xl font-bold leading-tight", colors.text)}
                 >
                   {data.theme === 'valentine' ? <>Happy <br/>Valentine's Day!</> :
                    data.theme === 'newyear' ? <>Happy <br/>New Year!</> :
                    data.theme === 'christmas' ? <>Merry <br/>Christmas!</> :
                    (data.theme === 'love' || data.theme === 'romantic') ? <>For You, <br/>With Love</> :
                    (data.theme === 'sleepy' || data.theme === 'galaxy' || data.theme === 'forest') ? <>A Gift <br/>For You</> :
                    <>Happy <br/>Birthday!</>}
                 </motion.h1>
               </div>
               
               <div className="flex-1 w-full flex items-center justify-center -mt-4 relative z-10 pointer-events-none">
                 <ThemeIcon theme={data.theme} />
               </div>

               <div className="mb-4 relative z-10 pointer-events-none">
                 <span className="animate-pulse inline-block text-sm font-medium opacity-60">
                   Click to open & Pop Balloons!
                 </span>
               </div>
            </div>
            
            {/* Inside Left (Back of the front cover) */}
            <div className={cn(
              "absolute inset-0 backface-hidden rounded-2xl shadow-inner border-r border-black/5 rotate-y-180 flex flex-col items-center p-6",
              colors.cardInside
            )}>
              {data.surprisePhoto && data.surprisePhoto !== 'none' ? (
                <div className="w-full flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="w-[85%] max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] aspect-[4/5] bg-white p-2.5 sm:p-3 md:p-4 pb-8 sm:pb-12 md:pb-14 shadow-lg rounded-sm rotate-[-2deg] transform-style-3d border border-gray-100 relative transition-all duration-300 hover:rotate-0 hover:scale-105">
                    {data.surprisePhoto === 'custom' && customPhotos.length > 0 ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden rounded-sm relative group">
                        <AnimatePresence initial={false}>
                          <motion.img
                            key={currentPhotoIndex}
                            src={customPhotos[currentPhotoIndex]}
                            alt={`Memory ${currentPhotoIndex + 1}`}
                            className="w-full h-full object-cover object-center absolute inset-0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          />
                        </AnimatePresence>
                        {customPhotos.length > 1 && (
                          <>
                            <button
                              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur rounded-full p-1 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : customPhotos.length - 1));
                              }}
                            >
                              <ChevronLeft className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur rounded-full p-1 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPhotoIndex((prev) => (prev < customPhotos.length - 1 ? prev + 1 : 0));
                              }}
                            >
                              <ChevronRight className="w-4 h-4 text-gray-700" />
                            </button>
                            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 z-10">
                              {customPhotos.map((_, idx) => (
                                <div key={idx} className={cn("w-1.5 h-1.5 rounded-full shadow-sm", idx === currentPhotoIndex ? "bg-white" : "bg-white/50")} />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <SurprisePhotoIcon photo={data.surprisePhoto} />
                    )}
                    <p className="font-handwriting text-xl sm:text-2xl lg:text-3xl text-pink-600 w-full absolute bottom-2 sm:bottom-3 md:bottom-4 left-0 right-0 text-center opacity-80 pointer-events-none">Memory! xoxo</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center opacity-20 transform scale-x-[-1] pointer-events-none w-full">
                  <ThemeIcon theme={data.theme} />
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
      </div>

      <div className="mt-12 flex gap-4 z-50">
        {isEditorPreview ? (
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 px-8 py-3 bg-white/60 backdrop-blur-sm border border-white/50 text-pink-600 rounded-full text-sm font-bold shadow-sm hover:bg-white/80 transition-all"
          >
           Continue Editing
          </button>
        ) : (
          <button 
            onClick={() => {
              // Redirect to landing page or signup page
              window.location.href = '/';
            }}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
           <RefreshCw className="w-5 h-5" />
           Create Your Own ✨
          </button>
        )}
      </div>

      {tracks[currentTrackIndex]?.id === 'custom' && tracks[currentTrackIndex]?.url && (tracks[currentTrackIndex]?.url?.includes('youtube.com') || tracks[currentTrackIndex]?.url?.includes('youtu.be')) && (() => {
        const Player: any = ReactPlayer;
        return (
          <Player
            url={tracks[currentTrackIndex].url}
            playing={isPlaying}
            loop={true}
            style={{ display: 'none' }}
            width="0"
            height="0"
            playsinline
            controls={false}
            onError={(e: any) => console.warn('ReactPlayer Error', e)}
          />
        );
      })()}
      
      <audio 
        loop 
        hidden
        ref={audioRef}
      />
      
      {data.recordedAudio && (
        <audio 
          hidden
          ref={voiceAudioRef}
          src={data.recordedAudio}
        />
      )}

    </div>
  );
}

function TypewriterText({ text, active }: { text: string; active: boolean }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplayedText('');
      setCurrentIndex(0);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Don't play sound for spaces and play less frequently for natural feel
        if (text[currentIndex] !== ' ' && text[currentIndex] !== '\n' && currentIndex % 2 === 0) {
           playTypewriterSound();
        }
      }, Math.random() * 30 + 30); // ~30-60ms per character
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, active, text]);

  return <span>{displayedText}</span>;
}
