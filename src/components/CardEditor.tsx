import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CardData, ThemeType, MusicType, PhotoType, FloatingEffectType } from '../types';
import { ThemeColors } from './ThemeGraphics';
import { cn, encodeCardData } from '../lib/utils';
import { Heart, PartyPopper, Moon, Music, Wand2, Copy, Check, Puzzle, Palette, Image as ImageIcon, Clock, Mic, Square, Gift, Sparkles, Save, FolderOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from './ui/ToastProvider';
import { useAuth } from '../App';
import { MediaLibrary } from './MediaLibrary';
import { fetchWithCsrf } from '../hooks/useCsrf';

interface CardEditorProps {
  initialData: CardData;
  onPreview: (data: CardData) => void;
  onSaveOnly?: () => void; // Optional callback when "Save Only" is clicked
}

export function CardEditor({ initialData, onPreview, onSaveOnly }: CardEditorProps) {
  const { token } = useAuth();
  const location = useLocation();
  const AUTOSAVE_KEY = 'magic_card_draft';
  const [data, setData] = useState<CardData>(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic check to see if it's a valid object
        if (parsed && typeof parsed === 'object') {
          return { enablePuzzles: true, puzzleLanguage: 'english', surprisePhoto: 'none', ...initialData, ...parsed };
        }
      }
    } catch (e) {}
    return { enablePuzzles: true, puzzleLanguage: 'english', surprisePhoto: 'none', ...initialData };
  });

  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryType, setMediaLibraryType] = useState<'all' | 'image' | 'audio' | 'video'>('all');
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<BlobPart[]>([]);
  const { toast } = useToast();

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
      const currentUrls = data.customPhotoUrls || (data.customPhotoUrl ? [data.customPhotoUrl] : []);
      setData({ ...data, customPhotoUrls: [...currentUrls, media.mediaUrl], surprisePhoto: 'custom' });
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
    const timer = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const handleGenerateAI = async () => {
    if (!data.to) {
      toast("Please enter a recipient name ('To') first!", "info");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-message', {
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
    try {
      let urlToCopy = shareUrl;
      const needsBackend = true; // Always save cards to DB now!
      
      // If there's a custom music or photo URL, we MUST save it to backend
      if (needsBackend) {
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
          urlToCopy = `${window.location.origin}/card?id=${result.id}`;
        } else {
          toast('Failed to generate sharing link due to server error.', 'error');
          return;
        }
      } else if (data.music === 'custom' && data.customMusicUrl) {
         // Formatting common links like google drive
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
         
         const updatedData = { ...data, customMusicUrl: modifiedUrl };
         urlToCopy = `${window.location.origin}/card?c=${encodeCardData(updatedData)}`;
      }

      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast('Magic link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      toast('Failed to copy link', 'error');
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
    { id: 'custom', label: 'Upload Photos' },
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
    { id: 'bg-gradient-to-br from-amber-100 to-yellow-200', label: 'Sunshine' },
    { id: 'bg-gradient-to-br from-rose-100 to-pink-200', label: 'Sweet Pink' },
    { id: 'bg-gradient-to-br from-indigo-100 to-blue-200', label: 'Dreamy Blue' },
    { id: 'bg-gradient-to-br from-purple-200 to-fuchsia-200', label: 'Magic Purple' },
    { id: 'bg-gradient-to-br from-emerald-100 to-teal-200', label: 'Minty Fresh' },
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
            {localStorage.getItem(AUTOSAVE_KEY) && (
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
          <h2 className="text-center text-xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 tracking-tight">
            Create a Bubu & Dudu Card
          </h2>
          <div className="flex gap-2 items-center mt-1 sm:mt-2 flex-wrap justify-center">
            <p className="text-center text-[11px] sm:text-sm font-semibold text-gray-500">
              Customize your 3D greeting card and share it.
            </p>
            <span className="text-[8px] sm:text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest hidden lg:inline-block">Auto-saving</span>
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
                 <audio controls src={data.recordedAudio} className="h-6 sm:h-8 w-full max-w-full sm:max-w-[200px] mx-auto" />
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
             {data.music === 'custom' && (
               <div className="mt-3 p-3 sm:p-4 bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl animate-in fade-in slide-in-from-top-2 space-y-3 sm:space-y-4">
                 <div>
                   <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Paste a YouTube or Audio Link</label>
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
               <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Surprise Photo Inside
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
                       const files = Array.from(e.target.files || []);
                       if (files.length) {
                         const currentUrls = data.customPhotoUrls || (data.customPhotoUrl ? [data.customPhotoUrl] : []);
                         
                         const processFiles = async () => {
                           let urls = [...currentUrls];
                           for (const file of files) {
                             if (file.size > 5000000) { // 5MB limit
                               alert(`File ${file.name} is too large! Please use photos under 5MB.`);
                               continue;
                             }
                             
                             const formData = new FormData();
                             formData.append('file', file);
                             // If UPLOAD_PRESET or CLOUD_NAME is missing, fallback to data URL for dev preview
                             const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
                             const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;
                             
                             if (!cloudName || !uploadPreset) {
                               console.warn("Cloudinary not configured.");
                               toast('Cloudinary configuration is missing', 'error');
                             } else {
                               formData.append('upload_preset', uploadPreset);
                               toast('Uploading image...', 'info');
                               try {
                                 const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                   method: 'POST',
                                   body: formData,
                                 });
                                 const data = await res.json();
                                 if (data.secure_url) {
                                   urls.push(data.secure_url);
                                 } else {
                                   toast('Failed to upload image.', 'error');
                                 }
                               } catch (err) {
                                 console.error("Cloudinary upload error", err);
                                 toast('Error uploading image.', 'error');
                               }
                             }
                           }
                           setData({ ...data, customPhotoUrls: urls });
                           setCopied(false);
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
                           <img src={url} alt={`Custom uploaded ${i + 1}`} className="w-full h-full object-cover" />
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
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
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
                  className="w-full sm:w-auto bg-white/70 border-2 border-white/80 focus:border-indigo-400 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 outline-none transition-all text-[10px] sm:text-xs font-medium text-gray-700 min-w-0 sm:min-w-[180px]"
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
                     <div className="w-8 h-8 bg-gradient-to-br from-indigo-300 to-blue-300 rounded-lg flex items-center justify-center text-white shadow-sm">
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
                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                   </label>
                 </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl transition-all">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-sm">
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
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
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
              onClick={() => onPreview(data)}
              className="w-full flex justify-center items-center gap-2 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-lg shadow-pink-200/50 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Save & Preview Card
            </button>
            
            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={async () => {
                  try {
                    const res = await fetchWithCsrf('/api/wishes', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                      },
                      body: JSON.stringify(data)
                    });
                    
                    if (!res.ok) throw new Error('Failed to save card');
                    
                    // Clear draft after save
                    localStorage.removeItem('magic_card_draft');
                    toast('Card saved successfully! ✨', 'success');
                    
                    // Navigate back to dashboard after short delay
                    setTimeout(() => {
                      if (onSaveOnly) {
                        onSaveOnly();
                      }
                    }, 800); // Short delay to show success message
                  } catch(e) {
                    toast('Failed to save card. Please try again.', 'error');
                  }
                }}
                className="flex justify-center items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200 text-pink-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-pink-50 hover:border-pink-300 transition-all"
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Save Only</span>
              </button>
              
              <button
                onClick={handleCopy}
                className="flex justify-center items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 bg-white/70 backdrop-blur-sm border-2 border-blue-200 text-blue-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-50 hover:border-blue-300 transition-all"
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
