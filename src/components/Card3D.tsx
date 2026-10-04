import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { YouTubeEmbed } from './YouTubeEmbed';
import confetti from 'canvas-confetti';
import { CardData, MusicType } from '../types';
import { ThemeIcon, ThemeColors, SurprisePhotoIcon } from './ThemeGraphics';
import { playTune, stopTune, playPageTurnSound } from '../lib/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Image as ImageIcon, Share, RefreshCw, Play, Pause, SkipForward, SkipBack, Music, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, GripHorizontal, Maximize2, X } from 'lucide-react';
import { cn, getYouTubeVideoId } from '../lib/utils';
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
  const [selectedFullPhoto, setSelectedFullPhoto] = useState<string | null>(null);
  const [isCustomPlayerMinimized, setIsCustomPlayerMinimized] = useState(false);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);
  
  const customPhotos = data.customPhotoUrls && data.customPhotoUrls.length > 0 
    ? data.customPhotoUrls 
    : (data.customPhotoUrl ? [data.customPhotoUrl] : []);
  const hasCustomPhotos = (data.surprisePhoto === 'custom' || (!data.surprisePhoto && customPhotos.length > 0) || (data.surprisePhoto !== 'none' && customPhotos.length > 0)) && customPhotos.length > 0;
  const hasPresetPhoto = ['cake', 'hug', 'stargazing'].includes(data.surprisePhoto || '');
  const hasPhoto = hasCustomPhotos || hasPresetPhoto;
  const hasVideo = !!data.customVideoUrl;
  const hasBoth = hasPhoto && hasVideo;
  const [activeMediaTab, setActiveMediaTab] = useState<'photo' | 'video'>('photo');

  useEffect(() => {
    if (!hasPhoto && hasVideo) {
      setActiveMediaTab('video');
    } else if (hasPhoto && !hasVideo) {
      setActiveMediaTab('photo');
    }
  }, [hasPhoto, hasVideo]);

  // Video & Background Music Auto-Ducking / Sync
  const wasMusicPlayingBeforeVideoRef = useRef(false);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);

  const handleVideoPlay = () => {
    if (isPlaying) {
      wasMusicPlayingBeforeVideoRef.current = true;
      stopTune();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  };

  const handleVideoPauseOrEnd = () => {
    if (wasMusicPlayingBeforeVideoRef.current && isOpen) {
      wasMusicPlayingBeforeVideoRef.current = false;
      const track = tracks[currentTrackIndex];
      if (track && track.id !== 'none') {
        playTune(track.id, track.url);
        setIsPlaying(true);
      }
    }
  };

  // Pause video if card is closed or user switches to photos tab
  useEffect(() => {
    if (!isOpen || (hasBoth && activeMediaTab === 'photo')) {
      if (mobileVideoRef.current) mobileVideoRef.current.pause();
      if (desktopVideoRef.current) desktopVideoRef.current.pause();
    }
  }, [isOpen, activeMediaTab, hasBoth]);
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
    const isReactPlayerUrl = isCustomAudio && (!!getYouTubeVideoId(originalUrl) || originalUrl.includes('youtube.com') || originalUrl.includes('youtu.be'));
    
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
    <div 
      ref={dragConstraintsRef}
      className="flex flex-col items-center justify-center w-full flex-1 py-1 sm:py-2 md:py-2.5 px-1.5 sm:px-4 overflow-hidden bg-transparent h-full relative"
    >
      
      {/* Floating Music Player - Draggable anywhere on screen */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            drag
            dragConstraints={dragConstraintsRef}
            dragMomentum={false}
            dragElastic={0.08}
            className={cn(
              "absolute z-60 bg-white/85 backdrop-blur-xl border border-white/80 shadow-lg hover:shadow-xl rounded-xl sm:rounded-2xl flex flex-col items-center p-1.5 sm:p-2.5 gap-1 sm:gap-2 scale-80 sm:scale-95 transform-gpu transition-shadow cursor-grab active:cursor-grabbing select-none touch-none",
              isEditorPreview 
                ? "top-3 right-4 sm:top-4 sm:right-4 origin-top-right" 
                : "top-3 left-3 sm:top-4 sm:left-4 origin-top-left"
            )}
          >
            <div className="flex items-center gap-1 sm:gap-2 text-pink-600 w-full justify-between px-1">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <GripHorizontal className="w-3 h-3 text-pink-400 opacity-60" />
                <Music className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold font-sans uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-20 sm:max-w-30">
                {tracks[currentTrackIndex]?.label || ''}
              </span>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-4 bg-white/40 rounded-full px-2.5 sm:px-4 py-1 sm:py-2 border border-white/50">
              <button 
                onClick={(e) => { e.stopPropagation(); skipTrack(-1); }}
                className="text-gray-500 hover:text-pink-500 transition-colors focus:outline-none"
              >
                <SkipBack className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                className="text-pink-500 hover:text-pink-600 transition-transform hover:scale-110 focus:outline-none drop-shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); skipTrack(1); }}
                className="text-gray-500 hover:text-pink-500 transition-colors focus:outline-none"
              >
                <SkipForward className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MOBILE VIEW (< md): Single-Page Top-to-Bottom Responsive Stack */}
      {/* Upper 50%: Photos / Image Section                            */}
      {/* Lower 50%: Message / Text Section                            */}
      {/* Both visible in single viewport without vertical scrolling   */}
      {/* ============================================================ */}
      <div className="flex md:hidden flex-col items-center justify-center w-full flex-1 min-h-0 py-0.5">
        <div 
          className="perspective-1000 w-full max-w-[min(410px,calc(100vw-20px))] h-[min(650px,calc(100dvh-100px))] min-h-115 cursor-pointer select-none"
          onClick={() => {
            setIsOpen(!isOpen);
            playPageTurnSound();
          }}
        >
          <div 
            className={cn(
              "relative w-full h-full transition-transform duration-700 ease-out transform-style-3d",
              isOpen ? "rotate-y-180" : "rotate-y-0"
            )}
          >
            {/* FRONT COVER (Visible when closed) */}
            <div 
              className={cn(
                "absolute inset-0 backface-hidden shadow-2xl rounded-2xl sm:rounded-3xl flex flex-col items-center justify-between p-5 overflow-hidden border border-white/40",
                data.cardColor && !data.cardColor.startsWith('#') ? data.cardColor : (!data.cardColor ? colors.cardOutside : "")
              )}
              style={data.cardColor?.startsWith('#') ? { backgroundColor: data.cardColor } : undefined}
            >
              <FloatingBalloons isActive={!isOpen} effectType={data.floatingEffect} />
              
              <div className="mt-4 text-center relative z-10 pointer-events-none">
                <motion.h1 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn("font-serif text-2xl sm:text-3xl font-bold leading-tight", colors.text)}
                >
                  {data.theme === 'valentine' ? <>Happy <br/>Valentine's Day!</> :
                   data.theme === 'newyear' ? <>Happy <br/>New Year!</> :
                   data.theme === 'christmas' ? <>Merry <br/>Christmas!</> :
                   (data.theme === 'love' || data.theme === 'romantic') ? <>For You, <br/>With Love</> :
                   (data.theme === 'sleepy' || data.theme === 'galaxy' || data.theme === 'forest') ? <>A Gift <br/>For You</> :
                   <>Happy <br/>Birthday!</>}
                </motion.h1>
              </div>
              
              <div className="flex-1 w-full flex items-center justify-center my-1 relative z-10 pointer-events-none">
                <div className="max-h-40 flex items-center justify-center">
                  <ThemeIcon theme={data.theme} />
                </div>
              </div>

              <div className="mb-2 relative z-10 pointer-events-none">
                <span className="animate-pulse inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white/40 backdrop-blur-xs text-pink-700 shadow-xs">
                  ✨ Tap to open & reveal surprise!
                </span>
              </div>
            </div>

            {/* OPEN CARD (Visible when opened): Upper 50% photos, Lower 50% message */}
            <div 
              className={cn(
                "absolute inset-0 backface-hidden rotate-y-180 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col border border-white/60",
                colors.cardInside
              )}
            >
              {/* UPPER 50%: Images/Photos Section */}
              <div className="h-1/2 min-h-0 w-full flex flex-col items-center justify-center p-2 sm:p-2.5 relative border-b border-pink-200/50 bg-white/20 backdrop-blur-xs overflow-hidden">
                {(hasPhoto || hasVideo) ? (
                  <div className="h-[94%] w-[94%] max-w-87.5 bg-white p-2 sm:p-2.5 pb-6 sm:pb-7 shadow-md rounded-lg sm:rounded-xl -rotate-1 border border-pink-100/70 relative flex flex-col items-center justify-between transition-transform duration-300 hover:rotate-0">
                    {/* Media Switcher Pill when BOTH Photos and Video exist */}
                    {hasBoth && (
                      <div 
                        className="flex items-center justify-center gap-1.5 mb-1.5 shrink-0 z-20"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveMediaTab('photo')}
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer",
                            activeMediaTab === 'photo'
                              ? "bg-pink-500 text-white shadow-sm"
                              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          )}
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>Photo{customPhotos.length > 1 ? `s (${customPhotos.length})` : ''}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMediaTab('video')}
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer",
                            activeMediaTab === 'video'
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          )}
                        >
                          <Video className="w-3 h-3" />
                          <span>Video 🎬</span>
                        </button>
                      </div>
                    )}

                    {((hasBoth && activeMediaTab === 'video') || (!hasPhoto && hasVideo)) ? (
                      <div 
                        className="w-full flex-1 bg-black rounded-xs overflow-hidden flex items-center justify-center relative min-h-0 select-none shadow-inner"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        {getYouTubeVideoId(data.customVideoUrl) ? (
                          <YouTubeEmbed
                            videoId={getYouTubeVideoId(data.customVideoUrl)!}
                            playing={false}
                            className="w-full h-full border-0"
                            onStateChange={(ytIsPlaying) => {
                              if (ytIsPlaying) handleVideoPlay();
                              else handleVideoPauseOrEnd();
                            }}
                          />
                        ) : (
                          <video
                            ref={mobileVideoRef}
                            src={data.customVideoUrl}
                            controls
                            playsInline
                            className="w-full h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                            onPlay={handleVideoPlay}
                            onPause={handleVideoPauseOrEnd}
                            onEnded={handleVideoPauseOrEnd}
                          />
                        )}
                      </div>
                    ) : hasCustomPhotos ? (
                      <div className="w-full flex-1 bg-neutral-900/5 flex items-center justify-center overflow-hidden rounded-xs relative group min-h-0 select-none">
                        {/* Ambient soft background to fill letterbox areas without cropping */}
                        <img
                          key={`bg-mob-${currentPhotoIndex}`}
                          src={customPhotos[currentPhotoIndex]}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-cover blur-md opacity-25 absolute inset-0 pointer-events-none scale-110"
                        />
                        <AnimatePresence initial={false}>
                          <motion.img
                            key={currentPhotoIndex}
                            src={customPhotos[currentPhotoIndex]}
                            alt={`Memory ${currentPhotoIndex + 1}`}
                            className="w-full h-full object-contain object-center absolute inset-0 z-1 p-0.5 cursor-zoom-in drop-shadow-xs"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFullPhoto(customPhotos[currentPhotoIndex]);
                            }}
                          />
                        </AnimatePresence>
                        {/* Zoom button */}
                        <button
                          className="absolute top-1 right-1 bg-white/80 backdrop-blur-xs rounded-full p-1 shadow-xs hover:bg-white text-gray-700 z-10 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFullPhoto(customPhotos[currentPhotoIndex]);
                          }}
                          aria-label="View full photo"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                        {customPhotos.length > 1 && (
                          <>
                            <button
                              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-xs rounded-full p-1 shadow-md hover:bg-white text-gray-700 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : customPhotos.length - 1));
                              }}
                              aria-label="Previous photo"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-xs rounded-full p-1 shadow-md hover:bg-white text-gray-700 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPhotoIndex((prev) => (prev < customPhotos.length - 1 ? prev + 1 : 0));
                              }}
                              aria-label="Next photo"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 z-10">
                              {customPhotos.map((_, idx) => (
                                <div key={idx} className={cn("w-1.5 h-1.5 rounded-full shadow-xs", idx === currentPhotoIndex ? "bg-white" : "bg-white/50")} />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex-1 flex items-center justify-center min-h-0">
                        <SurprisePhotoIcon photo={data.surprisePhoto || 'cake'} />
                      </div>
                    )}
                    <p className="font-handwriting text-base sm:text-lg text-pink-600 w-full absolute bottom-1 sm:bottom-1.5 left-0 right-0 text-center opacity-85 pointer-events-none">
                      Memory! xoxo
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2 pointer-events-none">
                    <div className="max-h-40 flex items-center justify-center">
                      <ThemeIcon theme={data.theme} />
                    </div>
                  </div>
                )}
              </div>

              {/* LOWER 50%: Message/Text Section */}
              <div className="h-1/2 min-h-0 w-full flex flex-col p-3.5 sm:p-5 items-center justify-between text-center relative overflow-hidden">
                <h2 className={cn(fontClass, "text-xl sm:text-2xl font-bold shrink-0 mb-1", colors.text)}>
                  Dear {data.to || 'Friend'},
                </h2>
                
                <div className="flex-1 w-full overflow-y-auto custom-scrollbar my-1 px-2 flex items-center justify-center min-h-0">
                  <p className={cn(fontClass, "text-base sm:text-lg whitespace-pre-wrap leading-relaxed tracking-wide", colors.text)}>
                    <TypewriterText text={data.message || 'Hoping you have a wonderful day!'} active={isTypingActive} />
                  </p>
                </div>
                
                <p className={cn(fontClass, "text-base sm:text-lg font-medium mt-auto shrink-0 transition-opacity duration-2000", isTypingActive ? "opacity-100 delay-2000" : "opacity-0", colors.text)}>
                  Love, {data.from || 'Me'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Action Button */}
        <div className="mt-2 flex gap-2 z-20 shrink-0">
          {isEditorPreview ? (
            <button 
              onClick={onEdit}
              className="flex items-center gap-1.5 px-6 py-2 bg-white/70 backdrop-blur-sm border border-white/60 text-pink-600 rounded-full text-xs font-bold shadow-sm hover:bg-white transition-all"
            >
              Continue Editing
            </button>
          ) : (
            <button 
              onClick={() => {
                window.location.href = '/';
              }}
              className="flex items-center gap-1.5 px-6 py-2 bg-linear-to-r from-pink-500 to-pink-600 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Create Your Own ✨
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP VIEW (>= md): Side-by-Side 3D Open Card Layout       */}
      {/* Left Page: Photos/Illustration, Right Page: Message          */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-col items-center justify-center w-full my-auto">
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
              "perspective-2000 md:w-[min(370px,calc(45vw-20px))] md:h-[min(460px,calc(100dvh-140px))] lg:w-[min(400px,calc(45vw-30px))] lg:h-[min(490px,calc(100dvh-140px))] cursor-pointer group shrink-0 transition-all duration-1500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              isOpen ? "md:translate-x-[45%] lg:translate-x-[50%] md:scale-[0.92] lg:scale-[0.94]" : "translate-x-0 scale-100"
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
              isOpen && isHovered ? "rotate-y-[-5deg] rotate-x-2 translate-z-10" : ""
            )}>
            
            {/* Base: Right Side of the inner card and actual back cover */}
            <div className={cn(
              "absolute inset-0 shadow-2xl rounded-2xl transform-style-3d overflow-hidden",
              colors.cardInside
            )}>
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
                 <p className={cn(fontClass, "text-2xl md:text-3xl font-medium mt-auto transition-opacity duration-2000", isTypingActive ? "opacity-100 delay-2000" : "opacity-0", colors.text)}>
                   Love, {data.from || 'Me'}
                 </p>
              </div>
            </div>
            
            {/* Cover: Left Side of the inner card and actual front cover */}
            <div 
              className={cn(
                "absolute inset-0 origin-left transition-transform duration-1500 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform-style-3d z-10",
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
                {(hasPhoto || hasVideo) ? (
                  <div className="w-full flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="w-[85%] max-w-50 sm:max-w-60 md:max-w-70 lg:max-w-[320px] aspect-4/5 bg-white p-2.5 sm:p-3 md:p-4 pb-8 sm:pb-12 md:pb-14 shadow-lg rounded-sm -rotate-2 transform-style-3d border border-gray-100 relative transition-all duration-300 hover:rotate-0 hover:scale-105 flex flex-col">
                      {/* Media Switcher Pill when BOTH Photos and Video exist */}
                      {hasBoth && (
                        <div 
                          className="flex items-center justify-center gap-2 mb-2 shrink-0 z-20"
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveMediaTab('photo')}
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer",
                              activeMediaTab === 'photo'
                                ? "bg-pink-500 text-white shadow-sm"
                                : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                            )}
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Photo{customPhotos.length > 1 ? `s (${customPhotos.length})` : ''}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMediaTab('video')}
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer",
                              activeMediaTab === 'video'
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            )}
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Video 🎬</span>
                          </button>
                        </div>
                      )}

                      {((hasBoth && activeMediaTab === 'video') || (!hasPhoto && hasVideo)) ? (
                        <div 
                          className="w-full flex-1 bg-black rounded-sm overflow-hidden flex items-center justify-center relative select-none shadow-inner"
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          {getYouTubeVideoId(data.customVideoUrl) ? (
                            <YouTubeEmbed
                              videoId={getYouTubeVideoId(data.customVideoUrl)!}
                              playing={false}
                              className="w-full h-full border-0"
                              onStateChange={(ytIsPlaying) => {
                                if (ytIsPlaying) handleVideoPlay();
                                else handleVideoPauseOrEnd();
                              }}
                            />
                          ) : (
                            <video
                              ref={desktopVideoRef}
                              src={data.customVideoUrl}
                              controls
                              playsInline
                              className="w-full h-full object-contain"
                              onClick={(e) => e.stopPropagation()}
                              onPlay={handleVideoPlay}
                              onPause={handleVideoPauseOrEnd}
                              onEnded={handleVideoPauseOrEnd}
                            />
                          )}
                        </div>
                      ) : hasCustomPhotos ? (
                        <div className="w-full h-full bg-neutral-900/5 flex items-center justify-center overflow-hidden rounded-sm relative group select-none">
                          {/* Ambient soft background to fill letterbox areas without cropping */}
                          <img
                            key={`bg-desk-${currentPhotoIndex}`}
                            src={customPhotos[currentPhotoIndex]}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover blur-md opacity-25 absolute inset-0 pointer-events-none scale-110"
                          />
                          <AnimatePresence initial={false}>
                            <motion.img
                              key={currentPhotoIndex}
                              src={customPhotos[currentPhotoIndex]}
                              alt={`Memory ${currentPhotoIndex + 1}`}
                              className="w-full h-full object-contain object-center absolute inset-0 z-1 p-0.5 cursor-zoom-in drop-shadow-xs"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFullPhoto(customPhotos[currentPhotoIndex]);
                              }}
                            />
                          </AnimatePresence>
                          {/* Zoom button */}
                          <button
                            className="absolute top-1.5 right-1.5 bg-white/80 backdrop-blur rounded-full p-1 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFullPhoto(customPhotos[currentPhotoIndex]);
                            }}
                            aria-label="View full photo"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          {customPhotos.length > 1 && (
                            <>
                              <button
                                className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur rounded-full p-1 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : customPhotos.length - 1));
                                }}
                                aria-label="Previous photo"
                              >
                                <ChevronLeft className="w-4 h-4 text-gray-700" />
                              </button>
                              <button
                                className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur rounded-full p-1 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentPhotoIndex((prev) => (prev < customPhotos.length - 1 ? prev + 1 : 0));
                                }}
                                aria-label="Next photo"
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
                        <SurprisePhotoIcon photo={data.surprisePhoto || 'cake'} />
                      )}
                      <p className="font-handwriting text-xl sm:text-2xl lg:text-3xl text-pink-600 w-full absolute bottom-2 sm:bottom-3 md:bottom-4 left-0 right-0 text-center opacity-80 pointer-events-none">Memory! xoxo</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 w-full flex items-center justify-center pointer-events-none p-2 sm:p-6">
                    <div className="w-full max-w-85 sm:max-w-100 md:max-w-110 flex items-center justify-center">
                      <ThemeIcon theme={data.theme} />
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
        </div>

        {/* Desktop Action Button */}
        <div className="mt-3 lg:mt-4 flex gap-4 z-50 shrink-0">
          {isEditorPreview ? (
            <button 
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-2 sm:px-8 sm:py-2.5 bg-white/70 backdrop-blur-sm border border-white/60 text-pink-600 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:bg-white transition-all"
            >
             Continue Editing
            </button>
          ) : (
            <button 
              onClick={() => {
                window.location.href = '/';
              }}
              className="flex items-center gap-2 px-6 py-2 sm:px-8 sm:py-2.5 bg-linear-to-r from-pink-500 to-pink-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
             <RefreshCw className="w-4 h-4" />
             Create Your Own ✨
            </button>
          )}
        </div>
      </div>

      {/* Floating YouTube Music Player Widget for Custom Music */}
      {isOpen && tracks[currentTrackIndex]?.id === 'custom' && tracks[currentTrackIndex]?.url && (() => {
        const rawUrl = tracks[currentTrackIndex].url || '';
        const videoId = getYouTubeVideoId(rawUrl);
        const isYouTube = !!videoId || rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be');
        if (!isYouTube) return null;

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            drag
            dragConstraints={dragConstraintsRef}
            dragMomentum={false}
            dragElastic={0.08}
            className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-75 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/80 bg-slate-900/90 backdrop-blur-md w-52 sm:w-64 max-w-[calc(100vw-24px)] cursor-grab active:cursor-grabbing select-none touch-none"
          >
            <div className="bg-linear-to-r from-pink-500 to-rose-500 px-2.5 py-1.5 flex items-center justify-between text-white text-[11px] font-bold">
              <span className="flex items-center gap-1.5 truncate max-w-30">
                <GripHorizontal className="w-3.5 h-3.5 opacity-70 shrink-0" />
                <Music className={cn("w-3.5 h-3.5 shrink-0", isPlaying && "animate-spin")} />
                <span className="truncate">Custom Song</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white rounded px-1.5 py-0.5 text-[9px] uppercase font-bold transition-colors cursor-pointer"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCustomPlayerMinimized(!isCustomPlayerMinimized);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white rounded p-0.5 text-[9px] transition-colors cursor-pointer"
                  title={isCustomPlayerMinimized ? "Expand video" : "Minimize video"}
                  aria-label={isCustomPlayerMinimized ? "Expand video" : "Minimize video"}
                >
                  {isCustomPlayerMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {!isCustomPlayerMinimized && (
              <div className="aspect-video w-full bg-black relative">
                <YouTubeEmbed
                  videoId={videoId}
                  playing={isPlaying}
                  autoPlay={true}
                  onStateChange={(playing) => setIsPlaying(playing)}
                  className="w-full h-full border-0"
                />
              </div>
            )}
          </motion.div>
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

      {/* Full-resolution photo modal lightbox */}
      <AnimatePresence>
        {selectedFullPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFullPhoto(null);
            }}
          >
            <div className="relative max-w-4xl max-h-[90dvh] flex flex-col items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFullPhoto(null);
                }}
                className="absolute -top-11 right-0 text-white/90 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedFullPhoto}
                alt="Full size memory"
                className="max-w-full max-h-[85dvh] object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      }, Math.random() * 30 + 30); // ~30-60ms per character
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, active, text]);

  return <span>{displayedText}</span>;
}
