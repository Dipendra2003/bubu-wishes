import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playPageTurnSound } from '../lib/audio';
import { cn } from '../lib/utils';

import { CardData, PuzzleLanguage } from '../types';

export function PuzzleSequence({ data, onComplete, language = 'english' }: { data?: CardData, onComplete: () => void; language?: PuzzleLanguage }) {
  const [step, setStep] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);

  useEffect(() => {
    const isCustom = !!data?.customRiddle && !!data?.customRiddleAnswer;
    let pool = ['math', 'memory', 'stars', 'catch'];
    
    // Sort pool randomly
    pool = pool.sort(() => 0.5 - Math.random());
    
    let selected: string[] = [];
    if (isCustom) {
      selected = ['riddle', pool[0], pool[1]];
    } else {
      pool.push('riddle');
      pool = pool.sort(() => 0.5 - Math.random());
      selected = [pool[0], pool[1], pool[2]];
    }
    
    // Shuffle the final sequence
    setSequence(selected.sort(() => 0.5 - Math.random()));
  }, [data]);

  const nextStep = () => {
    playPageTurnSound();
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  if (sequence.length === 0) return null;

  const renderPuzzle = () => {
    const puzzleType = sequence[step];
    const props = {
      onSolve: nextStep,
      language,
      pageIndex: step + 1,
      data
    };
    const puzzleKey = `p-${step}`;

    switch (puzzleType) {
      case 'stars': return <PuzzleOne key={puzzleKey} {...props} />;
      case 'riddle': return <PuzzleTwo key={puzzleKey} {...props} />;
      case 'catch': return <PuzzleThree key={puzzleKey} {...props} />;
      case 'math': return <MathPuzzle key={puzzleKey} {...props} />;
      case 'memory': return <MemoryPuzzle key={puzzleKey} {...props} />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full min-h-screen p-6 relative z-10">
      <AnimatePresence mode="wait">
        {renderPuzzle()}
      </AnimatePresence>
    </div>
  );
}

function PuzzleOne({ onSolve, language, pageIndex = 1 }: { onSolve: () => void; language: PuzzleLanguage; pageIndex?: number }) {
  const [stars, setStars] = useState([false, false, false, false, false]);
  const collected = stars.filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full"
    >
      <div className="text-5xl sm:text-6xl mb-4 grayscale opacity-80">🐼</div>
      <h3 className="text-2xl sm:text-3xl font-handwriting font-bold text-pink-600 mb-2">
        {language === 'hinglish' ? `Page ${pageIndex}: Stars Ikkattha Karo` : `Page ${pageIndex}: Star Gathering`}
      </h3>
      <p className="text-gray-600 text-xs sm:text-sm font-medium mb-6 sm:mb-8 text-center leading-relaxed">
        {language === 'hinglish' 
          ? 'Bubu ko tumhari help chahiye! Celebration start karne ke liye kam se kam 3 magic stars collect karo.' 
          : 'Bubu needs your help! Collect at least 3 magic stars to power up the celebration.'}
      </p>

      <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
        {stars.map((isCollected, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const newStars = [...stars];
              newStars[i] = true;
              setStars(newStars);
            }}
            className={cn(
              "text-3xl sm:text-4xl transition-all duration-300", 
              isCollected ? "opacity-30 grayscale filter" : "opacity-100 drop-shadow-md hover:drop-shadow-xl"
            )}
            disabled={isCollected}
          >
            ⭐
          </motion.button>
        ))}
      </div>

      <div className="w-full bg-white/60 h-4 rounded-full mb-6 sm:mb-8 overflow-hidden border border-white/50 shadow-inner">
        <div 
          className="bg-gradient-to-r from-pink-400 to-yellow-400 h-full transition-all duration-700 ease-out" 
          style={{ width: `${Math.min(100, (collected / 3) * 100)}%` }}
        />
      </div>

      <button
        onClick={onSolve}
        disabled={collected < 3}
        className={cn(
          "px-6 sm:px-8 py-3 rounded-full font-bold shadow-lg transition-all duration-300 w-full max-w-[200px]",
          collected >= 3 
            ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:shadow-xl hover:scale-105" 
            : "bg-white/50 text-gray-400 cursor-not-allowed border border-white/30"
        )}
      >
        {language === 'hinglish' ? 'Aage Badhe ✨' : 'Next Page ✨'}
      </button>
    </motion.div>
  );
}

const RIDDLES = [
  {
    en: "I can be very sweet, and I usually wear a little hat made of fire on your special day. What am I?",
    hi: "Main bahut sweet hoon, aur special day par mere sar par aag ki chhoti si hat hoti hai. Batao main kya hoon?",
    ans: ["cake"],
    hint: {
      en: "It's a baked dessert!",
      hi: "Ye ek baked meetha dessert hai!"
    }
  },
  {
    en: "I am tall when I'm young, and I'm short when I'm old. I glow in the dark. What am I?",
    hi: "Main paida hota hoon toh lamba hota hoon, aur jaate jaate chota. Main andhere mein roshni deta hoon. Main kya hoon?",
    ans: ["candle", "mombatti"],
    hint: {
      en: "I am put on top of birthday cakes!",
      hi: "Main cake ke upar lagai jati hoon!"
    }
  },
  {
    en: "I am covered in paper, but I'm not a book. I have a bow, but I shoot no arrows. What am I?",
    hi: "Main paper mein cover hota hoon par book nahi. Mere paas ribbon (bow) hai par main teer nahi chalata. Batao kya hoon?",
    ans: ["present", "gift", "tofa", "tohfa"],
    hint: {
      en: "You unwrap me on your birthday!",
      hi: "Tumne mujhe birthday par open kiya hoga!"
    }
  },
  {
    en: "I belong to you, but your friends use me more than you do. What am I?",
    hi: "Main tumhara hoon, par tumhare dost mera sabse zyada use karte hain. Main kya hoon?",
    ans: ["name", "naam"],
    hint: {
      en: "People call you by this!",
      hi: "Log tumhe isse bulate hain!"
    }
  }
];

function PuzzleTwo({ data, onSolve, language, pageIndex = 1 }: { data?: CardData, onSolve: () => void; language: PuzzleLanguage; pageIndex?: number }) {
  const [riddleIndex, setRiddleIndex] = useState(() => Math.floor(Math.random() * RIDDLES.length));
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHintPrompt, setShowHintPrompt] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Use custom riddle if provided, else preset
  const isCustom = !!data?.customRiddle && !!data?.customRiddleAnswer;
  const currentRiddle = isCustom ? {
    en: data.customRiddle!,
    hi: data.customRiddle!,
    ans: [data.customRiddleAnswer!.toLowerCase().trim()],
    hint: {
      en: data.customRiddleHint || "No hint provided!",
      hi: data.customRiddleHint || "Koi hint nahi mili!"
    }
  } : RIDDLES[riddleIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && !showHintPrompt) {
      timer = setTimeout(() => {
        setTimeLeft(pr => pr - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showHintPrompt) {
      setShowHintPrompt(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, showHintPrompt]);

  const checkAnswer = () => {
    const normalized = answer.toLowerCase().trim();
    if (currentRiddle.ans.some(a => normalized.includes(a) || (isCustom && normalized === a))) {
      onSolve();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  const handleNextRiddle = () => {
    if (isCustom) {
       // Just restart timer for custom riddle, can't change it
       setTimeLeft(30);
       setShowHintPrompt(false);
       setShowHint(false);
       setAnswer('');
       setError(false);
       return;
    }
    setRiddleIndex((prev) => (prev + 1) % RIDDLES.length);
    setTimeLeft(30);
    setShowHintPrompt(false);
    setShowHint(false);
    setAnswer('');
    setError(false);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setShowHintPrompt(false);
    setTimeLeft(30); 
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, x: -50, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col items-center text-center max-w-md w-full relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 h-1.5 bg-pink-100 w-full opacity-70">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / 30) * 100}%` }}
          transition={{ duration: 1, ease: 'linear' }}
          className="h-full bg-gradient-to-r from-pink-400 to-pink-500"
        />
      </div>
      
      {!showHintPrompt && (
        <div className="absolute top-4 right-4 bg-white/60 border border-white max-w-fit px-3 py-1 rounded-full shadow-sm flex items-center justify-center">
          <span className={cn("text-sm font-bold", timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-pink-500")}>
            ⏱️ {timeLeft}s
          </span>
        </div>
      )}

      <div className="text-5xl sm:text-6xl mb-2 grayscale opacity-80 mt-1">🎈</div>
      <h3 className="text-2xl sm:text-3xl font-handwriting font-bold text-pink-600 mb-2">
        {language === 'hinglish' ? `Page ${pageIndex}: Ek Paheli` : `Page ${pageIndex}: A Sweet Riddle`}
      </h3>
      <div className="min-h-[80px] flex items-center justify-center mb-4">
        <p className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed">
          {language === 'hinglish' ? currentRiddle.hi : currentRiddle.en}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {showHint && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-pink-50 text-pink-600 text-[11px] sm:text-xs font-bold p-3 rounded-xl mb-4 border border-pink-100"
          >
            💡 Hint: {language === 'hinglish' ? currentRiddle.hint.hi : currentRiddle.hint.en}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full relative min-h-[140px] flex flex-col">
        <AnimatePresence mode="wait">
          {showHintPrompt ? (
            <motion.div 
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col w-full gap-3 absolute top-0"
            >
              <p className="text-sm font-bold text-pink-500 mb-1">
                {showHint 
                  ? (language === 'hinglish' ? "Abhi bhi fas gaye? 😅" : "Still stuck? 😅")
                  : "Time's up! Need help? ⏰"}
              </p>
              <div className="flex gap-2 w-full justify-center">
                {!showHint ? (
                  <button
                    onClick={handleShowHint}
                    className="flex-1 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-xl text-xs sm:text-sm font-bold transition-all border border-yellow-200 shadow-sm"
                  >
                    {language === 'hinglish' ? 'Hint Chahiye? 💡' : 'Need a Hint? 💡'}
                  </button>
                ) : (
                  <button
                    onClick={onSolve}
                    className="flex-1 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl text-xs sm:text-sm font-bold transition-all border border-green-200 shadow-sm"
                  >
                    {language === 'hinglish' ? 'Skip Khelo ⏭️' : 'Give up & Skip ⏭️'}
                  </button>
                )}
                <button
                  onClick={handleNextRiddle}
                  className="flex-1 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl text-xs sm:text-sm font-bold transition-all border border-blue-200 shadow-sm"
                >
                  {isCustom ? (language === 'hinglish' ? 'Wapas Try Karo 🔄' : 'Try Again 🔄') : (language === 'hinglish' ? 'Nayi Paheli 🎲' : 'Change Riddle 🎲')}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex-1 flex flex-col">
              <input 
                type="text" 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder={language === 'hinglish' ? "Yahan answer likho..." : "Type your answer..."}
                className={cn(
                  "bg-white/70 border-2 rounded-2xl p-4 w-full text-center outline-none transition-all mb-4 text-pink-600 font-bold placeholder:text-pink-300 placeholder:font-normal", 
                  error ? "border-red-400 animate-bounce text-red-500" : "border-white/80 focus:border-pink-400 shadow-sm focus:shadow-md"
                )}
              />
              <button
                onClick={checkAnswer}
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full font-bold shadow-lg shadow-pink-200/50 hover:shadow-xl hover:scale-105 transition-all w-full max-w-[200px] mx-auto block mt-auto"
              >
                {language === 'hinglish' ? 'Kholo 🔓' : 'Unlock 🔓'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PuzzleThree({ onSolve, language, pageIndex = 1 }: { onSolve: () => void; language: PuzzleLanguage; pageIndex?: number }) {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleHover = () => {
    if (dodgeCount < 3) {
      setDodgeCount(prev => prev + 1);
      setPosition({
        // keep it within bounding box roughly
        x: (Math.random() - 0.5) * 180,
        y: (Math.random() - 0.5) * 100
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.4 }}
      className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center max-w-md w-full min-h-[350px] sm:min-h-[400px]"
    >
      <div className="text-5xl sm:text-6xl mb-4 grayscale opacity-80">🎀</div>
      <h3 className="text-2xl sm:text-3xl font-handwriting font-bold text-pink-600 mb-2">
        {language === 'hinglish' ? `Page ${pageIndex}: Aakhiri Padaw` : `Page ${pageIndex}: The Final Seal`}
      </h3>
      <p className="text-gray-600 text-xs sm:text-sm font-medium mb-8 sm:mb-12">
        {language === 'hinglish'
          ? 'Apna birthday card open karne ke liye Dudu ke magic button ko catch karo!'
          : 'Catch Dudu\'s magic button to finally open your birthday card!'}
      </p>

      <div className="relative w-full h-24 sm:h-32 flex items-center justify-center">
        <motion.button
          animate={{ x: position.x, y: position.y }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onMouseEnter={handleHover}
          onClick={onSolve}
          className="absolute px-8 py-4 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full font-bold shadow-xl hover:shadow-2xl z-20 whitespace-nowrap"
        >
          {dodgeCount < 3 
            ? (language === 'hinglish' ? "Pakad ke dikhao! 🏃💨" : "Click Me! 🏃💨") 
            : (language === 'hinglish' ? "Theek hai, tum jeet gaye! 🎁" : "Okay, you win! 🎁")}
        </motion.button>
      </div>
    </motion.div>
  );
}

function MathPuzzle({ onSolve, language, pageIndex = 1 }: { onSolve: () => void; language: PuzzleLanguage; pageIndex?: number }) {
  const [symbols] = useState(() => {
    const emojis = ['🎈', '🎂', '🎁', '⭐', '❤️', '🧸'];
    const shuffled = emojis.sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1]];
  });
  
  const [values] = useState(() => {
    return [
      Math.floor(Math.random() * 8) + 2, // 2 to 9
      Math.floor(Math.random() * 8) + 2
    ];
  });
  
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  
  const checkAnswer = () => {
    if (parseInt(answer.trim()) === values[1]) {
      onSolve();
    } else {
      setError(true);
      setTimeout(() => setError(false), 800);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4 }}
      className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full text-center"
    >
      <div className="text-5xl sm:text-6xl mb-4 grayscale opacity-80">🧮</div>
      <h3 className="text-2xl sm:text-3xl font-handwriting font-bold text-pink-600 mb-2">
        {language === 'hinglish' ? `Page ${pageIndex}: Emoji Math` : `Page ${pageIndex}: Emoji Math`}
      </h3>
      <p className="text-gray-600 text-xs sm:text-sm font-medium mb-6 sm:mb-8 text-center leading-relaxed">
        {language === 'hinglish' ? 'Dimag lagao aur iska answer nikalo!' : 'Use your brain to solve this!'}
      </p>

      <div className="text-2xl sm:text-3xl font-bold text-gray-700 bg-white/50 p-4 rounded-xl border border-white/40 w-full mb-6">
        <div className="mb-2 tracking-widest">{symbols[0]} + {symbols[0]} = {values[0] * 2}</div>
        <div className="mb-4 tracking-widest">{symbols[0]} + {symbols[1]} = {values[0] + values[1]}</div>
        <div className="text-pink-600 tracking-widest border-t-2 border-dashed border-gray-300 pt-4 mt-2">
          {symbols[1]} = ?
        </div>
      </div>

      <input 
        type="number" 
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
        placeholder={language === 'hinglish' ? "Number likho..." : "Type number..."}
        className={cn(
          "bg-white/70 border-2 rounded-2xl p-4 w-full text-center outline-none transition-all mb-4 text-pink-600 font-bold placeholder:text-pink-300 placeholder:font-normal", 
          error ? "border-red-400 animate-bounce text-red-500" : "border-white/80 focus:border-pink-400 shadow-sm focus:shadow-md"
        )}
      />
      <button
        onClick={checkAnswer}
        className="px-6 sm:px-8 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full font-bold shadow-lg shadow-pink-200/50 hover:shadow-xl hover:scale-105 transition-all w-full max-w-[200px] mx-auto block mt-auto"
      >
        {language === 'hinglish' ? 'Solve 🔓' : 'Solve 🔓'}
      </button>
    </motion.div>
  );
}

function MemoryPuzzle({ onSolve, language, pageIndex = 1 }: { onSolve: () => void; language: PuzzleLanguage; pageIndex?: number }) {
  const [cards, setCards] = useState(() => {
    const emojis = ['🎂', '🎈', '🎁'];
    const deck = [...emojis, ...emojis].sort(() => 0.5 - Math.random());
    return deck.map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
  });
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFlip = (index: number) => {
    if (isProcessing || cards[index].flipped || cards[index].matched) return;
    
    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    
    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [idx1, idx2] = newFlipped;
      if (cards[idx1].emoji === cards[idx2].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === idx1 || i === idx2 ? { ...c, matched: true, flipped: true } : c));
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === idx1 || i === idx2 ? { ...c, flipped: false } : c));
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setTimeout(onSolve, 800);
    }
  }, [cards, onSolve]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4 }}
      className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full text-center"
    >
      <div className="text-5xl sm:text-6xl mb-4 grayscale opacity-80">🧩</div>
      <h3 className="text-2xl sm:text-3xl font-handwriting font-bold text-pink-600 mb-2">
        {language === 'hinglish' ? `Page ${pageIndex}: Memory Match` : `Page ${pageIndex}: Memory Match`}
      </h3>
      <p className="text-gray-600 text-xs sm:text-sm font-medium mb-6 sm:mb-8 text-center leading-relaxed">
        {language === 'hinglish' ? 'Sabhi pairs dhoondo!' : 'Find all the matching pairs!'}
      </p>

      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            onClick={() => handleFlip(i)}
            disabled={card.flipped || card.matched}
            whileHover={{ scale: card.flipped ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "aspect-[3/4] flex items-center justify-center text-4xl sm:text-5xl rounded-xl transition-all duration-300 transform-style-3d",
              card.flipped ? "bg-white shadow-inner" : "bg-gradient-to-br from-pink-400 to-pink-500 shadow-md",
              card.matched && "opacity-50 grayscale"
            )}
            style={{ rotateY: card.flipped ? '180deg' : '0deg' }}
          >
            <span 
              className={cn("transition-opacity duration-300", card.flipped ? "opacity-100" : "opacity-0")}
              style={{ transform: "rotateY(180deg)" }}
            >
              {card.emoji}
            </span>
            <span 
              className={cn("absolute text-white tracking-widest leading-none inset-0 flex items-center justify-center opacity-40 mix-blend-overlay border border-white/20 rounded-xl transition-opacity duration-300", card.flipped ? "opacity-0" : "opacity-100")}
              style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 20px)` }}
            />
          </motion.button>
        ))}
      </div>
      
      <div className="w-full h-2 bg-gray-200/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-pink-400 transition-all duration-500"
          style={{ width: `${(cards.filter(c => c.matched).length / cards.length) * 100}%` }}
        />
      </div>
    </motion.div>
  );
}
