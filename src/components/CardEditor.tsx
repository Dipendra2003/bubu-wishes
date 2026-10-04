import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { YouTubeEmbed } from './YouTubeEmbed';
import { useNavigate, useLocation } from 'react-router-dom';
import { CardData, ThemeType, MusicType, PhotoType, FloatingEffectType } from '../types';
import { ThemeColors } from './ThemeGraphics';
import { cn, encodeCardData, getYouTubeVideoId } from '../lib/utils';
import { Heart, PartyPopper, Moon, Music, Wand2, Copy, Check, Puzzle, Palette, Image as ImageIcon, Clock, Mic, Square, Gift, Sparkles, Save, FolderOpen, Play, Pause, Volume2, Video, Link2, X } from 'lucide-react';
import { playTune, stopTune } from '../lib/audio';
import { motion } from 'motion/react';
import { useToast } from './ui/ToastProvider';
import { useAuth } from '../App';
import { MediaLibrary } from './MediaLibrary';
import { fetchWithCsrf } from '../hooks/useCsrf';

interface CardEditorProps {
  initialData: CardData;
  onPreview: (data: CardData) => void;
  onSaveOnly?: () => void; // Optional callback when "Save Only" is clicked
  cardId?: string | null;
  onCardSaved?: (id: string) => void;
}

export function CardEditor({ initialData, onPreview, onSaveOnly, cardId, onCardSaved }: CardEditorProps) {
  const { token } = useAuth();
  const location = useLocation();
  const AUTOSAVE_KEY = 'magic_card_draft';
  const [data, setData] = useState<CardData>(() => {
    // Only attempt to restore draft from localStorage when CREATING a new card (no cardId)
    if (!cardId) {
      try {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return { enablePuzzles: true, puzzleLanguage: 'english', surprisePhoto: 'none', ...initialData, ...parsed };
          }
        }
      } catch (e) {}
    }
    return { enablePuzzles: true, puzzleLanguage: 'english', surprisePhoto: 'none', ...initialData };
  });

  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryType, setMediaLibraryType] = useState<'all' | 'image' | 'audio' | 'video'>('all');
  const [activeCardId, setActiveCardId] = useState<string | null>(cardId || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlayingTestMusic, setIsPlayingTestMusic] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<BlobPart[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (cardId) {
      setActiveCardId(cardId);
      setData({ enablePuzzles: true, puzzleLanguage: 'english', surprisePhoto: 'none', ...initialData });
    }
  }, [cardId, initialData]);

  useEffect(() => {
    return () => {
      stopTune();
    };
  }, []);

  useEffect(() => {
    if (isPlayingTestMusic) {
      stopTune();
      setIsPlayingTestMusic(false);
    }
  }, [data.music, data.customMusicUrl]);

  const toggleTestMusic = () => {
    if (isPlayingTestMusic) {
      stopTune();
      setIsPlayingTestMusic(false);
    } else {
      if (data.music === 'none') return;
      if (data.music === 'custom') {
        if (!data.customMusicUrl) {
          toast('Please paste a YouTube or audio link first', 'info');
          return;
        }
        setIsPlayingTestMusic(true);
      } else {
        playTune(data.music);
        setIsPlayingTestMusic(true);
      }
    }
  };

  // Handle selected media from Media Library page
  useEffect(() => {
    const selectedMedia = sessionStorage.getItem('selectedMedia');
    if (selectedMedia) {
      try {
        const media = JSON.parse(selectedMedia);
        if (media.mediaType === 'image') {
          const currentUrls = data.customPhotoUrls || (data.customPhotoUrl ? [data.customPhotoUrl] : []);
          setData({ ...data, customPhotoUrls: [...currentUrls, media.mediaUrl], surprisePhoto: 'custom' });
          toast('Photo added from library! 📸', 'success');
        } else if (media.mediaType === 'audio') {
          setData({ ...data, recordedAudio: media.mediaUrl });
          toast('Voice note added from library! 🎤', 'success');
        } else if (media.mediaType === 'video') {
          setData(prev => ({ ...prev, customVideoUrl: media.mediaUrl }));
          toast('Video added from library! 🎬', 'success');
        }
        sessionStorage.removeItem('selectedMedia');
      } catch (e) {
        console.error('Failed to process selected media:', e);
      }
    }
  }, [location]);

  const openMediaLibrary = (type: 'image' | 'audio' | 'video') => {
    setMediaLibraryType(type);
    setShowMediaLibrary(true);
  };

  const handleMediaSelect = (media: any) => {
    if (media.mediaType === 'image') {
      const currentUrls = data.customPhotoUrls || (data.customPhotoUrl ? [data.customPhotoUrl] : []);
      setData({ ...data, customPhotoUrls: [...currentUrls, media.mediaUrl], surprisePhoto: 'custom' });
      toast('Photo added from library! 📸', 'success');
    } else if (media.mediaType === 'audio') {
      setData({ ...data, recordedAudio: media.mediaUrl });
      toast('Voice note added from library! 🎤', 'success');
    } else if (media.mediaType === 'video') {
      setData(prev => ({ ...prev, customVideoUrl: media.mediaUrl }));
      toast('Video added from library! 🎬', 'success');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // If user is authenticated, upload to media library (saves to DB + Cloudinary)
        if (token) {
          try {
            toast('Uploading voice note to library...', 'info');
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice-note.webm');
            formData.append('type', 'audio');
            
            const response = await fetchWithCsrf('/api/media-library', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
            
            if (!response.ok) {
              throw new Error('Upload failed');
            }
            
            const data = await response.json();
            setData(d => ({ ...d, recordedAudio: data.media.mediaUrl }));
            toast('Voice note saved to library! ☁️', 'success');
            return;
          } catch (error) {
            console.error('Media library upload failed:', error);
            toast('Trying fallback upload...', 'info');
          }
        }
        
        // Fallback: Direct Cloudinary upload (not saved to DB)
        const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        // Check if Cloudinary is configured
        if (!cloudName || !uploadPreset || uploadPreset === 'your_unsigned_preset') {
            // Fallback: Use base64 data URL for local storage
            toast('Using local storage for voice note...', 'info');
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                setData(d => ({ ...d, recordedAudio: reader.result as string }));
                toast('Voice note saved locally! ✨', 'success');
              }
            };
            reader.readAsDataURL(audioBlob);
            return;
        }
        
        // Try Cloudinary upload (no DB save)
        toast('Uploading voice note...', 'info');
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice-note.webm');
        formData.append('upload_preset', uploadPreset);
        
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
              method: 'POST',
              body: formData,
            });
            const responseData = await res.json();
            
            if (responseData.secure_url) {
              setData(d => ({ ...d, recordedAudio: responseData.secure_url }));
              toast('Voice note uploaded! ☁️', 'success');
            } else {
              // Fallback to base64 if Cloudinary fails
              console.warn('Cloudinary response:', responseData);
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                  setData(d => ({ ...d, recordedAudio: reader.result as string }));
                  toast('Voice note saved locally (Cloudinary unavailable)', 'info');
                }
              };
              reader.readAsDataURL(audioBlob);
            }
        } catch (err) {
            console.error("Cloudinary upload error", err);
            // Fallback to base64
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                setData(d => ({ ...d, recordedAudio: reader.result as string }));
                toast('Voice note saved locally (upload failed)', 'info');
              }
            };
            reader.readAsDataURL(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      toast("Microphone access denied", "error");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
  };

  React.useEffect(() => {
    // Only autosave drafts for new cards. Do NOT overwrite draft when editing existing DB cards!
    if (activeCardId || cardId) return;
    const timer = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, activeCardId, cardId]);

  const handleGenerateAI = async () => {
    if (!data.to) {
      toast("Please enter a recipient name ('To') first!", "info");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetchWithCsrf('/api/generate-message', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ to: data.to, context: data.message })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate message');
      }
      
      setData(prev => ({ ...prev, message: result.message }));
      toast('Message generated successfully', 'success');
    } catch (err: any) {
      console.error(err);
      toast("Failed to generate message: " + err.message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const shareUrl = `${window.location.origin}/card?c=${encodeCardData(data)}`;

  const handleCopy = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      let urlToCopy = shareUrl;
      const currentId = activeCardId || cardId;
      
      let updatedData = { ...data };
      if (data.music === 'custom' && data.customMusicUrl) {
         let modifiedUrl = data.customMusicUrl;
         if (modifiedUrl.includes('drive.google.com/file/d/')) {
            const match = modifiedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
               modifiedUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
            }
         } else if (modifiedUrl.includes('dropbox.com/') && !modifiedUrl.includes('raw=1')) {
            modifiedUrl = modifiedUrl.replace('?dl=0', '?raw=1').replace('?dl=1', '?raw=1');
            if (!modifiedUrl.includes('?')) modifiedUrl += '?raw=1';
         }
         updatedData.customMusicUrl = modifiedUrl;
      }

      if (currentId) {
        // Update existing card to avoid duplicate creation
        await fetchWithCsrf(`/api/wishes/${currentId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(updatedData),
        });
        urlToCopy = `${window.location.origin}/card?id=${currentId}`;
      } else {
        // Create new card record once
        const res = await fetchWithCsrf('/api/cards', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(updatedData),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.id) {
            setActiveCardId(result.id);
            if (onCardSaved) onCardSaved(result.id);
            urlToCopy = `${window.location.origin}/card?id=${result.id}`;
          }
        } else {
          toast('Failed to generate sharing link due to server error.', 'error');
          return;
        }
      }

      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast('Magic link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      toast('Failed to copy link', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const themes: { id: ThemeType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'party', label: 'Party', icon: <PartyPopper className="w-6 h-6" />, color: 'text-amber-500' },
    { id: 'love', label: 'Love', icon: <Heart className="w-6 h-6" />, color: 'text-rose-500' },
    { id: 'sleepy', label: 'Sleepy', icon: <Moon className="w-6 h-6" />, color: 'text-indigo-500' },
    { id: 'valentine', label: 'Valentine', icon: <Heart className="w-6 h-6" />, color: 'text-red-500' },
    { id: 'newyear', label: 'New Year', icon: <Sparkles className="w-6 h-6" />, color: 'text-slate-600' },
    { id: 'christmas', label: 'Christmas', icon: <Gift className="w-6 h-6" />, color: 'text-emerald-500' },
  ];

  const musicOptions: { id: MusicType; label: string }[] = [
    { id: 'happy_birthday', label: 'Happy Birthday' },
    { id: 'cute_bounce', label: 'Cute Bounce' },
    { id: 'mellow', label: 'Mellow Tune' },
    { id: 'none', label: 'No Music' },
    { id: 'custom', label: 'Custom URL' },
  ];

  const photoOptions: { id: PhotoType; label: string }[] = [
    { id: 'cake', label: 'Bubu & Dudu Cake' },
    { id: 'hug', label: 'Warm Hug' },
    { id: 'stargazing', label: 'Stargazing' },
    { id: 'custom', label: 'Upload Photos 📸' },
    { id: 'none', label: 'No Photo' },
  ];

  const floatingOptions: { id: FloatingEffectType; label: string; icon: string }[] = [
    { id: 'balloons', label: 'Balloons', icon: '🎈' },
    { id: 'hearts', label: 'Hearts', icon: '💕' },
    { id: 'snow', label: 'Snow', icon: '❄️' },
    { id: 'stars', label: 'Stars', icon: '🌠' },
    { id: 'pizza', label: 'Pizzas', icon: '🍕' },
    { id: 'none', label: 'None', icon: '🚫' },
  ];

  const colorOptions = [
    { id: 'bg-linear-to-br from-amber-100 to-yellow-200', label: 'Sunshine' },
    { id: 'bg-linear-to-br from-rose-100 to-pink-200', label: 'Sweet Pink' },
    { id: 'bg-linear-to-br from-indigo-100 to-blue-200', label: 'Dreamy Blue' },
    { id: 'bg-linear-to-br from-purple-200 to-fuchsia-200', label: 'Magic Purple' },
    { id: 'bg-linear-to-br from-emerald-100 to-teal-200', label: 'Minty Fresh' },
  ];

  return (
    <div className="flex-1 flex items-center justify-center py-3 sm:py-6 lg:py-12 px-3 sm:px-4 lg:px-8 bg-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-3 sm:space-y-6 lg:space-y-8 bg-white/40 backdrop-blur-xl border border-white/60 p-3 sm:p-6 lg:p-10 rounded-xl sm:rounded-3xl shadow-2xl relative"
      >
        <div className="relative mb-3 sm:mb-6 flex flex-col items-center">
          <div className="w-full flex justify-end mb-1 sm:mb-2">
            {!activeCardId && !cardId && localStorage.getItem(AUTOSAVE_KEY) && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to discard your draft?")) {
                    localStorage.removeItem(AUTOSAVE_KEY);
                    setData({ enablePuzzles: true, puzzleLanguage: 'english', surprisePhoto: 'none', ...initialData });
                    toast('Draft discarded', 'info');
                  }
                }}
                className="text-[8px] sm:text-[10px] text-gray-400 hover:text-red-500 font-bold tracking-wider uppercase transition-colors"
                title="Discard your saved changes"
              >
                Discard Draft
              </button>
            )}
          </div>
          <h2 className="text-center text-xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-blue-500 tracking-tight">
            {activeCardId || cardId ? 'Edit Bubu & Dudu Card' : 'Create a Bubu & Dudu Card'}
          </h2>
          <div className="flex gap-2 items-center mt-1 sm:mt-2 flex-wrap justify-center">
            <p className="text-center text-[11px] sm:text-sm font-semibold text-gray-500">
              {activeCardId || cardId ? 'Update your card details, music, and surprise elements.' : 'Customize your 3D greeting card and share it.'}
            </p>
            {!activeCardId && !cardId && (
              <span className="text-[8px] sm:text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest hidden lg:inline-block">Auto-saving</span>
            )}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-6 relative">
          <div className="grid grid-cols-1 gap-3 sm:gap-6 sm:grid-cols-2">
            <div>
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1.5 sm:mb-2 block uppercase tracking-widest">To</label>
              <input
                type="text"
                value={data.to}
                onChange={e => setData({ ...data, to: e.target.value })}
                className="block w-full bg-white/60 border border-white/80 rounded-lg sm:rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-300 p-2 sm:p-3 text-sm text-gray-700 outline-none backdrop-blur-sm transition-all"
                placeholder="Recipient's Name"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1.5 sm:mb-2 block uppercase tracking-widest">From</label>
              <input
                type="text"
                value={data.from}
                onChange={e => setData({ ...data, from: e.target.value })}
                className="block w-full bg-white/60 border border-white/80 rounded-lg sm:rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-300 p-2 sm:p-3 text-sm text-gray-700 outline-none backdrop-blur-sm transition-all"
                placeholder="Your Name"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 flex-wrap gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Message</label>
                <select
                  value={data.fontFamily || 'handwriting'}
                  onChange={(e) => setData({ ...data, fontFamily: e.target.value as any })}
                  className="bg-white/50 border border-white/80 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold text-gray-700 p-1 sm:p-1.5 outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value="sans">Modern Sans</option>
                  <option value="serif">Elegant Serif</option>
                  <option value="handwriting">Casual Pen</option>
                  <option value="dancing">Dancing Script</option>
                  <option value="pacifico">Pacifico</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating || !data.to}
                className="flex items-center gap-1 text-[9px] sm:text-xs font-bold text-pink-500 bg-pink-50 hover:bg-pink-100 py-1 px-2 sm:px-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className={cn("w-2.5 h-2.5 sm:w-3.5 sm:h-3.5", isGenerating && "animate-spin")} />
                <span className="hidden sm:inline">{isGenerating ? "Generating..." : "AI Suggestion"}</span>
                <span className="sm:hidden">AI</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={data.message}
              onChange={e => setData({ ...data, message: e.target.value })}
              className={cn(
                "block w-full bg-white/60 border border-white/80 rounded-lg sm:rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-300 p-2.5 sm:p-4 text-xs sm:text-sm text-gray-700 outline-none backdrop-blur-sm transition-all custom-scrollbar resize-none h-24 sm:h-32",
                data.fontFamily === 'sans' && "font-sans text-sm sm:text-base",
                data.fontFamily === 'serif' && "font-serif text-base sm:text-lg",
                data.fontFamily === 'dancing' && "font-dancing text-lg sm:text-2xl",
                data.fontFamily === 'pacifico' && "font-pacifico text-base sm:text-xl",
                (data.fontFamily === 'handwriting' || !data.fontFamily) && "font-handwriting text-base sm:text-xl"
              )}
              placeholder="Write a sweet message..."
            />
            <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 sm:p-3 bg-white/40 border border-white/60 rounded-lg sm:rounded-xl gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 shrink-0">
                   <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                   <span className="text-[10px] sm:text-xs font-bold text-gray-700 block">Voice Message</span>
                   <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium hidden sm:block truncate">Record a personalized audio message</span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0 justify-end sm:justify-start">
                {token && (
                  <button 
                    type="button"
                    onClick={() => openMediaLibrary('audio')}
                    className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-[9px] sm:text-xs font-bold transition-colors shadow-sm"
                    title="Open Audio Library"
                  >
                    <FolderOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">Library</span>
                  </button>
                )}
                {isRecording ? (
                  <button onClick={stopRecording} className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-[9px] sm:text-xs font-bold transition-colors shadow-sm animate-pulse">
                    <Square className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" /> <span>Stop</span>
                  </button>
                ) : (
                  <button onClick={startRecording} className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-[9px] sm:text-xs font-bold transition-colors shadow-sm">
                    <Mic className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span>Record</span>
                  </button>
                )}
                {data.recordedAudio && !isRecording && (
                   <button onClick={() => { setData({...data, recordedAudio: undefined}); setCopied(false); }} className="p-1 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm transition-colors" title="Delete Recording">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                )}
              </div>
            </div>
            {data.recordedAudio && !isRecording && (
              <div className="mt-2 text-center">
                 <audio controls src={data.recordedAudio} className="h-6 sm:h-8 w-full max-w-full sm:max-w-50 mx-auto" />
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 mb-2 sm:mb-3 block uppercase tracking-widest">Theme</label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setData({ ...data, theme: t.id })}
                  className={cn(
                    "flex flex-col items-center justify-center p-1.5 sm:p-4 rounded-lg sm:rounded-2xl border-2 transition-all duration-300",
                    data.theme === t.id 
                      ? "bg-pink-100/50 border-pink-400 shadow-sm scale-[1.02]" 
                      : "bg-white/40 border-transparent hover:bg-white/60 text-gray-500"
                  )}
                >
                  <div className={cn("mb-0.5 sm:mb-2 drop-shadow-sm", t.color)}>
                    {React.cloneElement(t.icon as React.ReactElement, { 
                      className: "w-4 h-4 sm:w-6 sm:h-6" 
                    } as any)}
                  </div>
                  <span className={cn("text-[9px] sm:text-xs font-bold leading-tight", data.theme === t.id ? "text-pink-600" : "")}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4" /> Card Cover Color
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {colorOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setData({ ...data, cardColor: opt.id })}
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all shadow-sm",
                    (data.cardColor === opt.id || (!data.cardColor && ThemeColors[data.theme].cardOutside === opt.id))
                      ? "scale-110 border-gray-900" 
                      : "border-transparent hover:scale-105", 
                    opt.id
                  )}
                  title={opt.label}
                />
              ))}
              <div 
                className={cn(
                  "relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all overflow-hidden shadow-sm flex items-center justify-center bg-gray-100",
                  data.cardColor?.startsWith('#') ? "scale-110 border-gray-900" : "border-transparent hover:scale-105"
                )}
                title="Custom Color"
              >
                 <input 
                   type="color" 
                   className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 -top-4 -left-4 sm:-top-5 sm:-left-5 cursor-pointer"
                   value={data.cardColor?.startsWith('#') ? data.cardColor : '#ffffff'}
                   onChange={(e) => setData({ ...data, cardColor: e.target.value })}
                 />
              </div>
            </div>
          </div>

          <div>
             <label className="text-[10px] sm:text-xs font-bold text-gray-500 mb-2 sm:mb-3 block uppercase tracking-widest">Music Tune</label>
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
               {musicOptions.map((opt) => (
                 <button
                   key={opt.id}
                   onClick={() => setData({ ...data, music: opt.id })}
                   className={cn(
                     "p-2 sm:p-3 rounded-lg sm:rounded-2xl border-2 transition-all flex flex-col items-center gap-1 sm:gap-2 duration-300",
                     data.music === opt.id
                       ? "bg-pink-100/50 border-pink-400 text-pink-600 shadow-sm"
                       : "bg-white/40 border-transparent text-gray-500 hover:bg-white/60"
                   )}
                 >
                   <Music className={cn("w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm", data.music === opt.id ? "opacity-100" : "opacity-50")} />
                   <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{opt.label}</span>
                 </button>
               ))}
             </div>
              {/* Music Test / Preview Control for Presets */}
              {data.music !== 'none' && data.music !== 'custom' && (
                <div className="flex items-center justify-between mt-2.5 pt-2 px-1 border-t border-pink-100/60">
                  <button
                    type="button"
                    onClick={toggleTestMusic}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer",
                      isPlayingTestMusic
                        ? "bg-rose-500 text-white shadow-pink-200 animate-pulse"
                        : "bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200"
                    )}
                  >
                    {isPlayingTestMusic ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlayingTestMusic ? 'Stop Test' : 'Test Music'}</span>
                  </button>
                  <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                    <Volume2 className={cn("w-3.5 h-3.5", isPlayingTestMusic ? "text-pink-500 animate-bounce" : "text-gray-400")} />
                    {isPlayingTestMusic ? 'Playing melody preview...' : 'Click to hear tune'}
                  </span>
                </div>
              )}

              {data.music === 'custom' && (
                <div className="mt-3 p-3 sm:p-4 bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl animate-in fade-in slide-in-from-top-2 space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Paste a YouTube or Audio Link</label>
                      {data.customMusicUrl && (
                        <button
                          type="button"
                          onClick={toggleTestMusic}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs",
                            isPlayingTestMusic
                              ? "bg-rose-500 text-white animate-pulse"
                              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          )}
                        >
                          {isPlayingTestMusic ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                          <span>{isPlayingTestMusic ? 'Stop Preview' : 'Play Preview'}</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={data.customMusicUrl || ''}
                      onChange={e => {
                        let val = e.target.value;
                        if (val.includes('drive.google.com/file/d/')) {
                          const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
                          if (match && match[1]) {
                            val = `https://drive.google.com/uc?export=download&id=${match[1]}`;
                          }
                        } else if (val.includes('dropbox.com/') && !val.includes('raw=1')) {
                          val = val.replace('?dl=0', '?raw=1').replace('?dl=1', '?raw=1');
                          if (!val.includes('?')) val += '?raw=1';
                        }
                        setData({ ...data, customMusicUrl: val });
                      }}
                      className="block w-full bg-white/60 border border-white/80 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-pink-300 p-2 sm:p-3 text-xs sm:text-sm text-gray-700 outline-none backdrop-blur-sm transition-all"
                      placeholder="https://youtu.be/... or https://example.com/song.mp3"
                    />

                    {/* YouTube Video Recognition & Visual Preview Player */}
                    {data.customMusicUrl && (() => {
                      const ytId = getYouTubeVideoId(data.customMusicUrl);
                      if (ytId) {
                        return (
                          <div className="mt-2.5 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                              <span className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Valid YouTube video recognized! Ready to play on card unwrap.</span>
                              </span>
                              <span className="text-[10px] text-emerald-600 font-semibold uppercase">Interactive Preview</span>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-pink-200 shadow-md bg-black relative max-w-sm mx-auto aspect-video">
                              <YouTubeEmbed
                                videoId={ytId}
                                playing={isPlayingTestMusic}
                                autoPlay={isPlayingTestMusic}
                                onStateChange={(playing) => setIsPlayingTestMusic(playing)}
                                className="w-full h-full border-0"
                              />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Non-YouTube Audio Preview */}
                    {isPlayingTestMusic && data.customMusicUrl && !getYouTubeVideoId(data.customMusicUrl) && (
                      <audio
                        autoPlay
                        loop
                        src={data.customMusicUrl}
                        onError={() => {
                          toast('Failed to load audio file preview', 'error');
                          setIsPlayingTestMusic(false);
                        }}
                      />
                    )}
                  </div>
                 <div className="flex items-center gap-3 sm:gap-4">
                   <div className="flex-1 h-px bg-gray-200"></div>
                   <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">OR</span>
                   <div className="flex-1 h-px bg-gray-200"></div>
                 </div>
                 <div>
                   <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Upload Audio (&lt; 3MB for sharing)</label>
                   <input
                     type="file"
                     accept="audio/*"
                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         if (file.size > 3000000) {
                           setCopied(false);
                           alert("File is too large! Please use an audio file under 3MB or paste a web link instead.");
                           return;
                         }
                         const reader = new FileReader();
                         reader.onloadend = () => {
                           if (typeof reader.result === 'string') {
                             setData({ ...data, customMusicUrl: reader.result });
                           }
                         };
                         reader.readAsDataURL(file);
                       }
                     }}
                     className="block w-full text-[10px] sm:text-xs text-gray-500 file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-[10px] sm:file:text-xs file:font-bold file:bg-pink-100 file:text-pink-600 hover:file:bg-pink-200 file:transition-colors file:cursor-pointer cursor-pointer"
                   />
                 </div>
               </div>
             )}
          </div>

          <div>
             <label className="text-[10px] sm:text-xs font-bold text-gray-500 mb-2 sm:mb-3 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
               <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Surprise Photo / Illustration Inside
             </label>
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
               {photoOptions.map((opt) => (
                 <button
                   key={opt.id}
                   onClick={() => setData({ ...data, surprisePhoto: opt.id })}
                   className={cn(
                     "p-2 sm:p-3 rounded-lg sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 sm:gap-2 duration-300",
                     data.surprisePhoto === opt.id
                       ? "bg-pink-100/50 border-pink-400 text-pink-600 shadow-sm"
                       : "bg-white/40 border-transparent text-gray-500 hover:bg-white/60"
                   )}
                 >
                   <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{opt.label}</span>
                 </button>
               ))}
             </div>

             {data.surprisePhoto === 'custom' && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="mt-4 p-4 rounded-2xl bg-white/40 border border-white/60 space-y-4"
               >
                 <div className="flex items-center justify-between mb-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload Photos (&lt; 3MB total for sharing)</label>
                   {token && (
                     <button
                       type="button"
                       onClick={() => openMediaLibrary('image')}
                       className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-[10px] font-bold transition-colors"
                     >
                       <FolderOpen className="w-3 h-3" /> Open Library
                     </button>
                   )}
                 </div>
                 <div>
                   <input 
                     type="file" 
                     accept="image/*"
                     multiple
                     onChange={(e) => {
                       const fileInput = e.target;
                       const files = Array.from(fileInput.files || []);
                       if (files.length) {
                         const currentUrls = data.customPhotoUrls || (data.customPhotoUrl ? [data.customPhotoUrl] : []);
                         
                         const processFiles = async () => {
                           let urls = [...currentUrls];
                           const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
                           const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;
                           toast(files.length === 1 ? 'Uploading photo...' : `Uploading ${files.length} photos...`, 'info');

                           let successCount = 0;
                           let failCount = 0;

                           for (const file of files) {
                             if (file.size > 5000000) { // 5MB limit
                               toast(`File "${file.name}" exceeds 5MB limit.`, 'error');
                               failCount++;
                               continue;
                             }

                             let uploadedUrl = '';

                             // 1. Try upload to user's media library via backend (Cloudinary + DB)
                             if (token) {
                               try {
                                 const formData = new FormData();
                                 formData.append('file', file);
                                 formData.append('type', 'image');

                                 const res = await fetchWithCsrf('/api/media-library', {
                                   method: 'POST',
                                   headers: { Authorization: `Bearer ${token}` },
                                   body: formData,
                                 });

                                 if (res.ok) {
                                   const resJson = await res.json();
                                   if (resJson.media?.mediaUrl) {
                                     uploadedUrl = resJson.media.mediaUrl;
                                   }
                                 }
                               } catch (err) {
                                 console.warn("Backend media-library upload failed, falling back to direct upload:", err);
                               }
                             }

                             // 2. Direct Cloudinary unsigned upload fallback
                             if (!uploadedUrl && cloudName && uploadPreset) {
                               try {
                                 const formData = new FormData();
                                 formData.append('file', file);
                                 formData.append('upload_preset', uploadPreset);

                                 const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                   method: 'POST',
                                   body: formData,
                                 });

                                 if (res.ok) {
                                   const resJson = await res.json();
                                   if (resJson.secure_url) {
                                     uploadedUrl = resJson.secure_url;
                                   }
                                 }
                               } catch (err) {
                                 console.warn("Direct Cloudinary upload failed:", err);
                               }
                             }

                             // 3. Fallback to local Data URL preview
                             if (!uploadedUrl) {
                               try {
                                 uploadedUrl = await new Promise<string>((resolve) => {
                                   const reader = new FileReader();
                                   reader.onload = () => resolve((reader.result as string) || '');
                                   reader.onerror = () => resolve('');
                                   reader.readAsDataURL(file);
                                 });
                               } catch (e) {}
                             }

                             if (uploadedUrl) {
                               urls.push(uploadedUrl);
                               successCount++;
                             } else {
                               failCount++;
                             }
                           }

                           if (successCount > 0) {
                             setData(prev => ({ ...prev, customPhotoUrls: urls, surprisePhoto: 'custom' }));
                             setCopied(false);
                             toast(`Successfully uploaded ${successCount} photo${successCount > 1 ? 's' : ''}! 📸`, 'success');
                           }
                           if (failCount > 0 && successCount === 0) {
                             toast(`Failed to upload ${failCount} photo${failCount > 1 ? 's' : ''}.`, 'error');
                           }
                           if (fileInput) fileInput.value = '';
                         };
                         processFiles();
                       }
                     }}
                     className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 transition-all cursor-pointer"
                   />
                 </div>
                 {((data.customPhotoUrls && data.customPhotoUrls.length > 0) || data.customPhotoUrl) && (
                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Previews</label>
                     <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                       {(data.customPhotoUrls || (data.customPhotoUrl ? [data.customPhotoUrl] : [])).map((url, i) => (
                         <div key={i} className="relative w-24 h-24 shrink-0 rounded-lg bg-black/5 overflow-hidden flex items-center justify-center group">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={url} alt={`Custom uploaded ${i + 1}`} className="w-full h-full object-contain p-1" />
                           <button
                             onClick={() => {
                               const arr = data.customPhotoUrls || (data.customPhotoUrl ? [data.customPhotoUrl] : []);
                               const newArr = arr.filter((_, idx) => idx !== i);
                               setData({ ...data, customPhotoUrls: newArr });
                             }}
                             className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </motion.div>
             )}

              

           {/* Dedicated Video Greeting Section - Can be used together with photos! */}
           <div className="p-3.5 sm:p-5 rounded-2xl bg-white/40 border border-white/60 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                  <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                  <span>Video Greeting Inside 🎬</span>
                  {data.customVideoUrl ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 animate-pulse">
                      Active ✨
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-gray-400">
                      (Optional - Plays with Photos!)
                    </span>
                  )}
                </label>
                {token && (
                  <button
                    type="button"
                    onClick={() => openMediaLibrary('video')}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-[10px] font-bold transition-colors shadow-sm"
                  >
                    <FolderOpen className="w-3 h-3" /> Video Library
                  </button>
                )}
              </div>

              {/* YouTube or Video URL Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-gray-500">YouTube, Shorts, or Direct MP4 URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      value={data.customVideoUrl || ''}
                      onChange={(e) => {
                        setData({ ...data, customVideoUrl: e.target.value });
                        setCopied(false);
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/70 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-700"
                    />
                  </div>
                  {data.customVideoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setData({ ...data, customVideoUrl: '' });
                        setCopied(false);
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">OR Upload File</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* File Upload Input */}
              <div>
                <input 
                  type="file" 
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={(e) => {
                    const fileInput = e.target;
                    const file = fileInput.files?.[0];
                    if (file) {
                      if (file.size > 30000000) {
                        toast('Video exceeds 30MB limit.', 'error');
                        return;
                      }

                      const processVideo = async () => {
                        toast('Uploading video...', 'info');
                        let uploadedUrl = '';
                        const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
                        const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

                        if (token) {
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('type', 'video');

                            const res = await fetchWithCsrf('/api/media-library', {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` },
                              body: formData,
                            });

                            if (res.ok) {
                              const resJson = await res.json();
                              if (resJson.media?.mediaUrl) {
                                uploadedUrl = resJson.media.mediaUrl;
                              }
                            }
                          } catch (err) {
                            console.warn('Backend video upload failed:', err);
                          }
                        }

                        if (!uploadedUrl && cloudName && uploadPreset) {
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('upload_preset', uploadPreset);

                            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
                              method: 'POST',
                              body: formData,
                            });

                            if (res.ok) {
                              const resJson = await res.json();
                              if (resJson.secure_url) {
                                uploadedUrl = resJson.secure_url;
                              }
                            }
                          } catch (err) {
                            console.warn('Direct Cloudinary video upload failed:', err);
                          }
                        }

                        if (!uploadedUrl && file.size < 5000000) {
                          try {
                            uploadedUrl = await new Promise<string>((resolve) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve((reader.result as string) || '');
                              reader.onerror = () => resolve('');
                              reader.readAsDataURL(file);
                            });
                          } catch (e) {}
                        }

                        if (uploadedUrl) {
                          setData(prev => ({ ...prev, customVideoUrl: uploadedUrl }));
                          setCopied(false);
                          toast('Video uploaded successfully! 🎬', 'success');
                        } else {
                          toast('Failed to upload video to cloud. Try pasting a YouTube link instead!', 'error');
                        }
                        if (fileInput) fileInput.value = '';
                      };
                      processVideo();
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all cursor-pointer"
                />
              </div>

              {/* Video Preview */}
              {data.customVideoUrl && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Video Preview</label>
                    <span className="text-[10px] text-purple-600 font-semibold">Plays in card Polaroid frame! 🎬</span>
                  </div>
                  <div className="relative w-full aspect-video max-h-56 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-purple-200 shadow-sm">
                    {getYouTubeVideoId(data.customVideoUrl) ? (
                      <YouTubeEmbed videoId={getYouTubeVideoId(data.customVideoUrl)!} playing={false} className="w-full h-full border-0" />
                    ) : (
                      <video src={data.customVideoUrl} controls playsInline className="w-full h-full object-contain" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setData({ ...data, customVideoUrl: '' });
                        setCopied(false);
                      }}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors z-20"
                      title="Remove Video"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
           </div>

           </div>

          <div className="flex flex-col gap-2 mt-3 sm:mt-4 relative z-10">
             <div className="flex flex-col gap-2 mb-2">
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                  <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" /> Floating Effects
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                  {floatingOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setData({ ...data, floatingEffect: opt.id })}
                      className={cn(
                        "p-2 sm:p-3 rounded-lg sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 sm:gap-2 duration-300",
                        data.floatingEffect === opt.id || (!data.floatingEffect && opt.id === 'none')
                          ? "bg-pink-100/50 border-pink-400 text-pink-600 shadow-sm"
                          : "bg-white/40 border-transparent text-gray-500 hover:bg-white/60"
                      )}
                    >
                      <span className="text-base sm:text-xl leading-none">{opt.icon}</span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
             </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl transition-all hover:bg-white/60 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-indigo-400 to-blue-400 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700 block">Date/Time Lock</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-medium hidden sm:block">Lock card until a specific time</span>
                </div>
              </div>
              <div className="flex flex-col items-end w-full sm:w-auto">
                <input
                  type="datetime-local"
                  value={data.unlockDate || ''}
                  onChange={(e) => {
                    setData({ ...data, unlockDate: e.target.value });
                    setCopied(false);
                  }}
                  className="w-full sm:w-auto bg-white/70 border-2 border-white/80 focus:border-indigo-400 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 outline-none transition-all text-[10px] sm:text-xs font-medium text-gray-700 min-w-0 sm:min-w-45"
                />
                {data.unlockDate && (
                  <button
                    onClick={() => {
                      setData({ ...data, unlockDate: undefined, lockScreenImage: undefined });
                      setCopied(false);
                    }}
                    className="text-[9px] sm:text-[10px] text-red-400 mt-1 hover:text-red-600 font-medium"
                  >
                    Clear Lock
                  </button>
                )}
              </div>
            </div>

            {data.unlockDate && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-2 p-4 bg-white/40 border border-white/60 rounded-2xl transition-all"
              >
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-sm font-bold text-gray-700 block">Lock Screen Image (Optional)</span>
                 </div>
                 <div className="flex items-center">
                   <input 
                     type="file" 
                     accept="image/*"
                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         if (file.size > 3 * 1024 * 1024) {
                           alert("File is too large! Please use a photo under 3MB.");
                           return;
                         }
                         const reader = new FileReader();
                         reader.onloadend = () => {
                           setData({ ...data, lockScreenImage: reader.result as string });
                           setCopied(false);
                         };
                         reader.readAsDataURL(file);
                       }
                     }}
                     className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer"
                   />
                 </div>
                 {data.lockScreenImage && (
                   <div className="mt-2">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Preview</label>
                     <div className="w-full h-32 rounded-lg bg-black/5 overflow-hidden flex items-center justify-center relative">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={data.lockScreenImage} alt="Lock screen preview" className="max-w-full max-h-full object-contain" />
                       <button
                         onClick={() => setData({ ...data, lockScreenImage: undefined })}
                         className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                       </button>
                     </div>
                   </div>
                 )}
                 <div className="flex items-center justify-between p-3 mt-2 bg-white/50 border border-white/50 rounded-xl transition-all hover:bg-white/70">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-linear-to-br from-indigo-300 to-blue-300 rounded-lg flex items-center justify-center text-white shadow-sm">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
                     </div>
                     <div>
                       <span className="text-sm font-bold text-gray-700 block">Allow Skip Lock</span>
                       <span className="text-xs text-gray-500 font-medium">Let recipient skip the countdown</span>
                     </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer ml-3">
                     <input
                       type="checkbox"
                       checked={data.allowSkipLock || false}
                       onChange={(e) => {
                         setData({ ...data, allowSkipLock: e.target.checked });
                         setCopied(false);
                       }}
                       className="sr-only peer"
                     />
                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                   </label>
                 </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl transition-all">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-blue-400 to-purple-400 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-sm">
                  <Puzzle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700 block">Multi-Page Puzzle</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-medium hidden sm:block">Require solving fun puzzles before opening</span>
                </div>
              </div>
              
              <button
                onClick={() => setData({ ...data, enablePuzzles: !data.enablePuzzles })}
                className={cn("w-12 h-6 rounded-full p-1 transition-all duration-300", data.enablePuzzles ? "bg-pink-400" : "bg-gray-300")}
              >
                <div className={cn("w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm", data.enablePuzzles ? "translate-x-6" : "translate-x-0")}></div>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl hover:bg-white/60 transition-all cursor-pointer gap-2 sm:gap-0" onClick={() => setData({ ...data, enableInteractiveUnwrap: !data.enableInteractiveUnwrap })}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-purple-400 to-pink-400 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700 block">Interactive Unwrap</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-medium hidden sm:block">Recipient taps to tear open a virtual gift box</span>
                </div>
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); setData({ ...data, enableInteractiveUnwrap: !data.enableInteractiveUnwrap }); }}
                className={cn("w-10 h-5 sm:w-12 sm:h-6 rounded-full p-0.5 sm:p-1 transition-all duration-300", data.enableInteractiveUnwrap ? "bg-pink-400" : "bg-gray-300")}
              >
                <div className={cn("w-4 h-4 sm:w-4 sm:h-4 bg-white rounded-full transition-transform duration-300 shadow-sm", data.enableInteractiveUnwrap ? "translate-x-5 sm:translate-x-6" : "translate-x-0")}></div>
              </button>
            </div>
            
            {data.enablePuzzles && (
              <div className="flex flex-col gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between p-4 bg-white/40 border border-white/60 rounded-2xl transition-all">
                  <div>
                    <span className="text-sm font-bold text-gray-700 block">Puzzle Language</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setData({ ...data, puzzleLanguage: 'english' })}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", data.puzzleLanguage !== 'hinglish' ? "bg-pink-400 text-white shadow-sm" : "bg-white/50 text-gray-500 hover:bg-white/70")}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setData({ ...data, puzzleLanguage: 'hinglish' })}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", data.puzzleLanguage === 'hinglish' ? "bg-pink-400 text-white shadow-sm" : "bg-white/50 text-gray-500 hover:bg-white/70")}
                    >
                      Hinglish
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white/40 border border-white/60 rounded-2xl space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Custom Riddle (Optional)</label>
                    <p className="text-[10px] text-gray-500 mb-2">Leave blank to use random preset riddles.</p>
                    <input
                      type="text"
                      placeholder="Enter your custom riddle here..."
                      value={data.customRiddle || ''}
                      onChange={(e) => {
                        setData({ ...data, customRiddle: e.target.value });
                        setCopied(false);
                      }}
                      className="w-full bg-white/70 border-2 border-white/80 focus:border-pink-400 rounded-xl px-4 py-2 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  {data.customRiddle && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Custom Riddle Answer</label>
                        <input
                          type="text"
                          placeholder="Answer here..."
                          value={data.customRiddleAnswer || ''}
                          onChange={(e) => {
                            setData({ ...data, customRiddleAnswer: e.target.value });
                            setCopied(false);
                          }}
                          className="w-full bg-white/70 border-2 border-white/80 focus:border-pink-400 rounded-xl px-4 py-2 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Custom Hint (Optional)</label>
                        <input
                          type="text"
                          placeholder="Hint for the answer..."
                          value={data.customRiddleHint || ''}
                          onChange={(e) => {
                            setData({ ...data, customRiddleHint: e.target.value });
                            setCopied(false);
                          }}
                          className="w-full bg-white/70 border-2 border-white/80 focus:border-pink-400 rounded-xl px-4 py-2 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
            {/* Primary Action - Save & Preview */}
            <button
              disabled={isSaving}
              onClick={async () => {
                if (isSaving) return;
                setIsSaving(true);
                try {
                  stopTune();
                  setIsPlayingTestMusic(false);
                  await onPreview(data);
                } finally {
                  setIsSaving(false);
                }
              }}
              className="w-full flex justify-center items-center gap-2 py-3 sm:py-4 px-4 sm:px-6 bg-linear-to-r from-pink-500 to-pink-600 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-lg shadow-pink-200/50 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span>{isSaving ? 'Saving Card...' : 'Save & Preview Card'}</span>
            </button>
            
            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                disabled={isSaving}
                onClick={async () => {
                  if (isSaving) return;
                  setIsSaving(true);
                  try {
                    stopTune();
                    setIsPlayingTestMusic(false);
                    const currentId = activeCardId || cardId;
                    const url = currentId ? `/api/wishes/${currentId}` : '/api/wishes';
                    const method = currentId ? 'PUT' : 'POST';
                    const res = await fetchWithCsrf(url, {
                      method,
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                      },
                      body: JSON.stringify(data)
                    });
                    
                    if (!res.ok) {
                      const errJson = await res.json().catch(() => ({}));
                      throw new Error(errJson.error || errJson.message || 'Failed to save card');
                    }
                    const saved = await res.json();
                    if (!currentId && saved?.id) {
                      setActiveCardId(saved.id);
                      if (onCardSaved) onCardSaved(saved.id);
                    }
                    
                    // Clear draft after save when creating new card
                    if (!currentId) {
                      localStorage.removeItem(AUTOSAVE_KEY);
                    }
                    toast('Card saved successfully! ✨', 'success');
                    
                    // Navigate back to dashboard after short delay
                    setTimeout(() => {
                      if (onSaveOnly) {
                        onSaveOnly();
                      }
                    }, 500);
                  } catch(e: any) {
                    toast(e?.message || 'Failed to save card. Please try again.', 'error');
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="flex justify-center items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200 text-pink-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-pink-50 hover:border-pink-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Only'}</span>
              </button>
              
              <button
                disabled={isSaving}
                onClick={handleCopy}
                className="flex justify-center items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 bg-white/70 backdrop-blur-sm border-2 border-blue-200 text-blue-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                <span>{copied ? 'Copied!' : 'Get Link'}</span>
              </button>
            </div>
            
            {/* Helper Text */}
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                💡 Tip: Use <span className="font-bold text-pink-600">"Save & Preview"</span> to see your card in action!
              </p>
            </div>
          </div>
          
        </div>
      </motion.div>

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaSelect}
        filterType={mediaLibraryType}
      />
    </div>
  );
}
