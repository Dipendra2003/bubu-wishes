import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card3D } from '../Card3D';
import { PuzzleSequence } from '../PuzzleSequence';
import { UnwrapBox } from '../UnwrapBox';
import { CountdownLock } from '../CountdownLock';
import { CardData } from '../../types';
import { decodeCardData } from '../../lib/utils';
import { stopTune } from '../../lib/audio';
import { Share2 } from 'lucide-react';
import { useToast } from '../ui/ToastProvider';
import confetti from 'canvas-confetti';

export default function CardView() {
  const [params] = useSearchParams();
  const [cardData, setCardData] = useState<CardData | null>(null);
  
  const [puzzlesSolved, setPuzzlesSolved] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isBoxUnwrapped, setIsBoxUnwrapped] = useState(false);
  const [error, setError] = useState(false);
  const hasTriggeredConfetti = useRef(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const encodedData = params.get('c');
    const id = params.get('id');

    const loadData = async () => {
      let decoded: any = null;
      if (id) {
        try {
          const res = await fetch(`/api/cards/${id}`);
          if (res.ok) {
            decoded = await res.json();
          }
        } catch (e) {
          console.error("Failed to fetch card", e);
        }
      } else if (encodedData) {
        decoded = decodeCardData(encodedData);
      }
      
      if (decoded) {
        setCardData({ enablePuzzles: true, ...decoded });
        setPuzzlesSolved(!decoded.enablePuzzles); // Auto-solve if disabled
        setIsBoxUnwrapped(!decoded.enableInteractiveUnwrap);
        
        // Check if locked
        if (decoded.unlockDate) {
          const targetDate = new Date(decoded.unlockDate).getTime();
          if (targetDate > new Date().getTime()) {
            setIsLocked(true);
          }
        }
      } else {
        setError(true);
      }
    };
    
    loadData();

    return () => {
      stopTune();
    };
  }, [params]);

  useEffect(() => {
    if (cardData && !isLocked && puzzlesSolved && isBoxUnwrapped && !hasTriggeredConfetti.current) {
      if (cardData.theme === 'party') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          zIndex: 100,
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        });
      }
      hasTriggeredConfetti.current = true;
    }
  }, [cardData, isLocked, puzzlesSolved, isBoxUnwrapped]);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-500 font-bold">Sorry, we couldn't find this magic card!</div>;
  }

  if (!cardData) {
    return <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-500 font-bold">Opening magic card...</div>;
  }

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Magic Birthday Card',
          text: 'Open this to see your magic surprise card! ✨',
          url: url,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(url)
            .then(() => toast('Link copied to clipboard!', 'success'))
            .catch(() => toast('Failed to copy link', 'error'));
        }
      }
    } else {
      navigator.clipboard.writeText(url)
        .then(() => toast('Link copied to clipboard!', 'success'))
        .catch(() => toast('Failed to copy link', 'error'));
    }
  };

  return (
    <div className="flex-1 relative font-sans flex flex-col overflow-hidden bg-[#FFF0F5] h-screen w-screen absolute inset-0 z-50">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFD1DC] rounded-full blur-[120px] opacity-60 pointer-events-none z-0"></div>
      
      {cardData && !isLocked && puzzlesSolved && isBoxUnwrapped && (
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 z-50 p-2.5 bg-white/50 hover:bg-white backdrop-blur-md rounded-full shadow-lg border border-pink-200/50 text-pink-500 transition-all hover:scale-105 active:scale-95"
          aria-label="Share this card"
        >
          <Share2 className="w-5 h-5" />
        </button>
      )}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full mx-auto relative h-full">
         {isLocked ? (
             <CountdownLock 
              unlockDate={cardData.unlockDate!} 
              lockScreenImage={cardData.lockScreenImage}
              allowSkipLock={cardData.allowSkipLock}
              theme={cardData.theme} 
              onUnlock={() => setIsLocked(false)} 
              isEditorPreview={false}
              onEdit={() => {}}
            />
          ) : puzzlesSolved ? (
            isBoxUnwrapped ? (
              <Card3D data={cardData} onEdit={() => {}} isEditorPreview={false} />
            ) : (
              <UnwrapBox onUnwrapped={() => setIsBoxUnwrapped(true)} theme={cardData.theme} />
            )
          ) : (
            <PuzzleSequence data={cardData} onComplete={() => setPuzzlesSolved(true)} language={cardData.puzzleLanguage || 'english'} />
          )}
      </div>
    </div>
  );
}
