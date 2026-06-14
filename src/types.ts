export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  verified?: boolean;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  birthday?: string;
  location?: string;
  timezone?: string;
  createdAt?: string;
  googleId?: string | null;
  password?: string;
}

export interface Wish {
  id: string;
  userId: string;
  authorName: string;
  message: string;
  recipient: string;
  createdAt: string;
}

export type ThemeType = 'party' | 'romantic' | 'night' | 'galaxy' | 'forest' | 'love' | 'sleepy' | 'valentine' | 'newyear' | 'christmas';
export type MusicType = 'happy_birthday' | 'romantic' | 'funny' | 'custom' | 'cute_bounce' | 'mellow' | 'none';
export type PhotoType = 'none' | 'custom' | 'cake' | 'hug' | 'stargazing';
export type FloatingEffectType = 'none' | 'hearts' | 'stars' | 'confetti' | 'balloons' | 'snow' | 'pizza';
export type PuzzleLanguage = 'english' | 'nepali' | 'hindi' | 'hinglish';
export type FontType = 'sans' | 'handwriting' | 'dancing' | 'pacifico' | 'serif';

export interface CardData {
  to: string;
  from: string;
  message: string;
  fontFamily?: FontType;
  theme: ThemeType;
  music: MusicType;
  customMusicUrl?: string;
  recordedAudio?: string;
  enablePuzzles: boolean;
  puzzleLanguage: PuzzleLanguage;
  surprisePhoto?: PhotoType;
  customPhotoUrl?: string;
  customPhotoUrls?: string[];
  floatingEffect?: FloatingEffectType;
  allowSkipLock?: boolean;
  lockScreenImage?: string;
  unlockDate?: string;
  enableInteractiveUnwrap?: boolean;
  cardColor?: string;
  customRiddle?: string;
  customRiddleAnswer?: string;
  customRiddleHint?: string;
}
