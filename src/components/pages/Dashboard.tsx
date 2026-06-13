import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CardEditor } from '../CardEditor';
import { Card3D } from '../Card3D';
import { PuzzleSequence } from '../PuzzleSequence';
import { UnwrapBox } from '../UnwrapBox';
import { CountdownLock } from '../CountdownLock';
import { ReviewForm } from '../ReviewForm';
import { CardData } from '../../types';
import { encodeCardData } from '../../lib/utils';
import { motion } from 'motion/react';
import { stopTune } from '../../lib/audio';
import { useToast } from '../ui/ToastProvider';
import confetti from 'canvas-confetti';
import { calculateAge, getZodiacSign, daysUntilBirthday, isMilestoneBirthday, getMilestoneBadge, getRelationshipEmoji } from '../../lib/birthdayUtils';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [wishes, setWishes] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [dashboardTheme, setDashboardTheme] = useState('classic');
  const [isLoadingWishes, setIsLoadingWishes] = useState(true); // Add loading state
  
  // Verification State
  const [verifying, setVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const [cardData, setCardData] = useState<CardData>({
    to: '',
    from: user?.name || '',
    message: '',
    theme: 'party',
    music: 'happy_birthday',
    enablePuzzles: true,
    puzzleLanguage: 'english'
  });
  
  // Preview states
  const [isPreview, setIsPreview] = useState(false);
  const [puzzlesSolved, setPuzzlesSolved] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isBoxUnwrapped, setIsBoxUnwrapped] = useState(false);
  const { toast } = useToast();
  
  const handleRequestVerify = async () => {
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast('Verification code sent to your email!', 'info');
      setVerifying(true);
    } catch(e) {
      toast('Failed to send verification code', 'error');
    }
  };

  const handleVerifySubmit = async () => {
    if (!otpCode || otpCode.length < 6) {
      toast('Please enter a valid 6-digit code', 'error');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast('Email verified successfully! Refreshing...', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch(e: any) {
      toast(e.message || 'Invalid code', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  // Get active tab from URL params, default to 'cards'
  const activeTab = (searchParams.get('tab') as 'cards' | 'contacts') || 'cards';
  
  const setActiveTab = (tab: 'cards' | 'contacts') => {
    navigate(`/dashboard?tab=${tab}`, { replace: true });
  };
  const [contacts, setContacts] = useState<any[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ 
    name: '', 
    email: '', 
    birthday: '', 
    imageUrl: '',
    relationship: 'friend',
    notes: '',
    favorite: false
  });
  const [contactImagePreview, setContactImagePreview] = useState<string | null>(null);
  const [uploadingContactImage, setUploadingContactImage] = useState(false);
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Review State
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // Contact Management State
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [deleteContactConfirmOpen, setDeleteContactConfirmOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  useEffect(() => {
    fetchWishes();
    fetchContacts();
  }, []);

  // Handle URL parameters on mount and when they change
  useEffect(() => {
    const createParam = searchParams.get('create');
    const editParam = searchParams.get('edit');
    
    if (createParam === 'true') {
      // Restore create mode from URL
      if (!isCreating) {
        setIsCreating(true);
      }
      setEditingCardId(null);
      
      // Try to restore draft only if cardData is empty
      if (!cardData.to && !cardData.message) {
        const draft = localStorage.getItem('magic_card_draft');
        if (draft) {
          try {
            const parsedDraft = JSON.parse(draft);
            setCardData(parsedDraft);
          } catch (e) {
            console.error('Failed to parse draft', e);
          }
        }
      }
    } else if (editParam) {
      // Restore edit mode from URL
      if (!isCreating && wishes.length > 0) {
        const cardToEdit = wishes.find(w => w.id === editParam);
        if (cardToEdit) {
          let parsedData = cardToEdit.cardData;
          if (typeof parsedData === 'string') {
            try {
              parsedData = JSON.parse(parsedData);
            } catch (e) {
              console.error("Failed to parse cardData", e);
              parsedData = null;
            }
          }
          
          if (parsedData) {
            setCardData(parsedData);
          } else {
            setCardData({
              to: cardToEdit.recipient,
              from: user?.name || '',
              message: cardToEdit.message,
              theme: cardToEdit.theme || 'party',
              music: 'happy_birthday',
              enablePuzzles: true,
              puzzleLanguage: 'english'
            });
          }
          setEditingCardId(editParam);
          setIsCreating(true);
        }
      }
    } else {
      // No URL params, ensure we're in dashboard view
      if (isCreating && !isPreview) {
        setIsCreating(false);
        setEditingCardId(null);
      }
    }
  }, [searchParams, wishes.length]);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Check if user needs verification  
      if (res.status === 403) {
        const data = await res.json();
        if (data.verified === false) {
          toast('Please verify your email to access contacts', 'error');
          return;
        }
      }
      
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch(e) {}
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts';
      const method = editingContact ? 'PUT' : 'POST';
      
      // Format birthday: always use year 2000 for recurring birthdays
      const contactData = {
        ...newContact,
        birthday: newContact.birthday ? `2000-${newContact.birthday.substring(5)}` : newContact.birthday
      };
      
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      
      if (res.ok) {
        toast(editingContact ? 'Contact updated successfully!' : 'Contact added successfully!', 'success');
        setIsAddingContact(false);
        setEditingContact(null);
        setNewContact({ 
          name: '', 
          email: '', 
          birthday: '', 
          imageUrl: '',
          relationship: 'friend',
          notes: '',
          favorite: false
        });
        setContactImagePreview(null);
        fetchContacts();
      } else {
         const data = await res.json();
         console.error('Contact save error:', data);
         toast(data.error || `Failed to ${editingContact ? 'update' : 'add'} contact`, 'error');
      }
    } catch(e) {
      console.error('Contact save exception:', e);
      toast(`Failed to ${editingContact ? 'update' : 'add'} contact`, 'error');
    }
  };

  const handleContactImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast('Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast('Image size should be less than 5MB', 'error');
      return;
    }

    setUploadingContactImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image'); // Add type parameter for upload controller

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setNewContact({ ...newContact, imageUrl: data.url });
        setContactImagePreview(data.url);
        toast('Image uploaded successfully!', 'success');
      } else {
        const error = await res.json();
        toast(error.error || 'Failed to upload image', 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast('Failed to upload image', 'error');
    } finally {
      setUploadingContactImage(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    setContactToDelete(id);
    setDeleteContactConfirmOpen(true);
  };

  const confirmDeleteContact = async () => {
    if (!contactToDelete) return;
    
    try {
      const res = await fetch(`/api/contacts/${contactToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast('Contact deleted', 'info');
        fetchContacts();
      }
    } catch(e) {
      toast('Failed to delete contact', 'error');
    } finally {
      setDeleteContactConfirmOpen(false);
      setContactToDelete(null);
    }
  };

  const startEditContact = (contact: any) => {
    setEditingContact(contact);
    
    // Format birthday for date input (MM-DD only, using current/next year)
    const birthdayDate = new Date(contact.birthday);
    const month = String(birthdayDate.getMonth() + 1).padStart(2, '0');
    const day = String(birthdayDate.getDate()).padStart(2, '0');
    const currentYear = new Date().getFullYear();
    const formattedBirthday = `${currentYear}-${month}-${day}`;
    
    setNewContact({
      name: contact.name,
      email: contact.email || '',
      birthday: formattedBirthday,
      imageUrl: contact.imageUrl || '',
      relationship: contact.relationship || 'friend',
      notes: contact.notes || '',
      favorite: contact.favorite || false
    });
    setContactImagePreview(contact.imageUrl || null);
    setIsAddingContact(true);
  };

  const cancelContactForm = () => {
    setIsAddingContact(false);
    setEditingContact(null);
    setNewContact({ 
      name: '', 
      email: '', 
      birthday: '', 
      imageUrl: '',
      relationship: 'friend',
      notes: '',
      favorite: false
    });
    setContactImagePreview(null);
  };

  const toggleFavorite = async (contactId: string, currentFavorite: boolean) => {
    try {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return;

      const res = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...contact,
          favorite: !currentFavorite
        })
      });

      if (res.ok) {
        fetchContacts();
        toast(currentFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
      }
    } catch (e) {
      toast('Failed to update favorite', 'error');
    }
  };

  const filteredContacts = contacts
    .filter(contact => {
      // Text search filter
      const searchMatch = contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(contactSearchQuery.toLowerCase()));
      
      // Relationship filter
      const relationshipMatch = relationshipFilter === 'all' || contact.relationship === relationshipFilter;
      
      // Favorites filter
      const favoriteMatch = !showFavoritesOnly || contact.favorite;
      
      return searchMatch && relationshipMatch && favoriteMatch;
    })
    .sort((a, b) => {
      // Sort favorites first, then by upcoming birthday
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      
      const daysA = daysUntilBirthday(a.birthday);
      const daysB = daysUntilBirthday(b.birthday);
      return daysA - daysB;
    });

  const fetchWishes = async () => {
    setIsLoadingWishes(true); // Start loading
    try {
      const res = await fetch('/api/wishes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Check if user needs verification
      if (res.status === 403) {
        const data = await res.json();
        if (data.verified === false) {
          toast('Please verify your email first', 'error');
          setWishes([]); // Clear wishes on error
          return;
        }
      }
      
      if (res.ok) {
        const data = await res.json();
        setWishes(data);
      } else {
        setWishes([]); // Clear wishes on error
      }
    } catch(e) {
      console.error('Failed to fetch wishes:', e);
      setWishes([]); // Clear wishes on error
    } finally {
      setIsLoadingWishes(false); // Stop loading
    }
  }

  const handlePreview = async (data: CardData) => {
    // Save to the db
    try {
      const url = editingCardId ? `/api/wishes/${editingCardId}` : '/api/wishes';
      const method = editingCardId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Failed to save card');

      // Clear the autosave draft after successful save
      localStorage.removeItem('magic_card_draft');

      fetchWishes();
      toast(editingCardId ? 'Card successfully updated!' : 'Card successfully created!', 'success');
      
      if (!editingCardId && data.theme === 'party') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 100
        });
      }
    } catch(e) {
      toast('Failed to save card', 'error');
      return; // Don't proceed to preview if save failed
    }

    setCardData(data);
    setIsPreview(true);
    setPuzzlesSolved(!data.enablePuzzles);
    setIsBoxUnwrapped(!data.enableInteractiveUnwrap);

    if (data.unlockDate && new Date(data.unlockDate).getTime() > new Date().getTime()) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  };

  const startEditCard = (wish: any) => {
    let parsedData = wish.cardData;
    if (typeof parsedData === 'string') {
        try {
            parsedData = JSON.parse(parsedData);
        } catch (e) {
            console.error("Failed to parse cardData", e);
            parsedData = null;
        }
    }
    
    if (parsedData) {
        setCardData(parsedData);
    } else {
        setCardData({
            to: wish.recipient,
            from: user?.name || '',
            message: wish.message,
            theme: wish.theme || 'party',
            music: 'happy_birthday',
            enablePuzzles: true,
            puzzleLanguage: 'english'
        });
    }
    setEditingCardId(wish.id);
    navigate(`/dashboard?edit=${wish.id}`);
    setIsCreating(true);
  };

  const startCreateNewCard = () => {
    // Clear any existing draft when creating a new card
    localStorage.removeItem('magic_card_draft');
    
    setCardData({
        to: '',
        from: user?.name || '',
        message: '',
        theme: 'party',
        music: 'happy_birthday',
        enablePuzzles: true,
        puzzleLanguage: 'english'
    });
    setEditingCardId(null);
    navigate('/dashboard?create=true');
    setIsCreating(true);
  };

  const handleCopyLink = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/card?id=${id}`;
    
    // Use the Web Share API if available (helpful for mobile users)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'A Magic Card For You!',
          text: 'I created a special magic card for you. Tap to open it!',
          url: url,
        });
        toast("Shared successfully!", "success");
        return;
      } catch (err: any) {
        // Fallback to clipboard if user cancels share dialog
        if (err.name !== 'AbortError') {
           console.log('Share error:', err);
        }
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard! Share it with your friend.", "success");
    } catch (err) {
      toast(`Could not copy automatically. Please copy this: ${url}`, "error");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!cardToDelete) return;
    
    try {
      await fetch(`/api/wishes/${cardToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchWishes();
      toast('Magic card deleted', 'info');
    } catch (err) {
      toast('Failed to delete card', 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setCardToDelete(null);
    }
  };

  const handleEdit = () => {
    setIsPreview(false);
    setPuzzlesSolved(false);
    setIsBoxUnwrapped(false);
    stopTune();
  };

  const closeEditor = () => {
    setIsCreating(false);
    setIsPreview(false);
    setEditingCardId(null);
    navigate('/dashboard');
    stopTune();
  };

  const getNextBirthdayData = () => {
    if (contacts.length === 0) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextContact = null;
    let minDays = Infinity;

    for (const c of contacts) {
      if (!c.birthday) continue;
      const bday = new Date(c.birthday);
      bday.setHours(0, 0, 0, 0);
      const nextBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      
      if (nextBday < today) {
        nextBday.setFullYear(today.getFullYear() + 1);
      }
      
      const diffDays = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < minDays) {
        minDays = diffDays;
        nextContact = c;
      }
    }

    return nextContact ? { contact: nextContact, days: minDays } : null;
  };

  const nextBirthdayData = getNextBirthdayData();

  const getThemeStyles = () => {
    switch(dashboardTheme) {
      case 'birthday':
        return { bg: 'bg-yellow-50', blobs: ['bg-yellow-200', 'bg-orange-200'], text: 'text-orange-600', button: 'bg-orange-500 hover:bg-orange-600' };
      case 'adventure':
        return { bg: 'bg-green-50', blobs: ['bg-emerald-200', 'bg-teal-200'], text: 'text-emerald-700', button: 'bg-emerald-500 hover:bg-emerald-600' };
      case 'more':
        return { bg: 'bg-purple-50', blobs: ['bg-purple-200', 'bg-fuchsia-200'], text: 'text-purple-600', button: 'bg-purple-500 hover:bg-purple-600' };
      case 'classic':
      default:
        return { bg: 'bg-[#FFF0F5]', blobs: ['bg-[#FFD1DC]', 'bg-[#B0E0E6]'], text: 'text-pink-600', button: 'bg-pink-500 hover:bg-pink-600' };
    }
  };

  const themeStyle = getThemeStyles();

  if (isPreview) {
    return (
      <div className="flex-1 relative font-sans flex flex-col overflow-hidden bg-[#FFF0F5]">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFD1DC] rounded-full blur-[120px] opacity-60 pointer-events-none z-0"></div>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full mx-auto relative h-full">
           {isLocked ? (
               <CountdownLock 
                unlockDate={cardData.unlockDate!} 
                lockScreenImage={cardData.lockScreenImage}
                allowSkipLock={cardData.allowSkipLock}
                theme={cardData.theme} 
                onUnlock={() => setIsLocked(false)} 
                isEditorPreview={true}
                onEdit={handleEdit}
              />
            ) : puzzlesSolved ? (
              isBoxUnwrapped ? (
                <Card3D data={cardData} onEdit={handleEdit} isEditorPreview={true} />
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

  if (isCreating) {
    return (
      <div className="max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col z-10 py-6 sm:py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-pink-600">{editingCardId ? 'Edit Magic Card' : 'Create Magic Card'}</h1>
          <button onClick={closeEditor} className="text-pink-500 font-bold hover:text-pink-700">Cancel</button>
        </div>
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl sm:rounded-[2.5rem] p-0 sm:p-5 shadow-none sm:shadow-[0_20px_50px_rgb(0,0,0,0.05)] border-0 sm:border border-white/60 relative">
          <CardEditor initialData={cardData!} onPreview={handlePreview} onSaveOnly={closeEditor} />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col z-10 py-6 sm:py-10 ${themeStyle.bg} min-h-screen relative overflow-hidden transition-colors duration-500`}>
      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${themeStyle.blobs[0]} rounded-full blur-[120px] opacity-60 pointer-events-none z-0 transition-colors duration-500`}></div>
      
      {/* Email Verification Warning Banner */}
      {!user?.verified && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-lg mb-2">⚠️ Email Verification Required</h3>
              <p className="text-amber-800 mb-4 text-sm">
                Your email is not verified yet. Please verify your email to use all features and create cards.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/verify-email'}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition shadow-md"
                >
                  Verify Email Now →
                </button>
                <button
                  onClick={handleRequestVerify}
                  className="px-5 py-2.5 bg-white hover:bg-amber-50 text-amber-700 border-2 border-amber-300 rounded-xl font-bold text-sm transition"
                >
                  Resend Code
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] ${themeStyle.blobs[1]} rounded-full blur-[120px] opacity-60 pointer-events-none z-0 transition-colors duration-500`}></div>

      <div className="relative z-10 w-full flex flex-col">
      {!user?.verified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex flex-col items-start gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
            <div>
               <h3 className="text-amber-800 font-bold">Please verify your email</h3>
               <p className="text-amber-600 text-sm font-medium">You need to verify your email address to unlock all features.</p>
            </div>
            {!verifying && (
              <button 
                onClick={handleRequestVerify}
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-sm transition text-sm text-center"
              >
                Send Verification Code
              </button>
            )}
          </div>
          
          {verifying && (
            <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-2 pt-4 border-t border-amber-200">
              <input 
                type="text" 
                placeholder="Enter 6-digit code" 
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-full sm:w-64 px-4 py-2 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button 
                onClick={handleVerifySubmit}
                disabled={otpLoading}
                className="w-full sm:w-auto px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition disabled:opacity-50"
              >
                {otpLoading ? 'Verifying...' : 'Submit'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 font-medium">Create cards and track birthdays</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => setIsReviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-pink-600 bg-white hover:bg-pink-50 border border-pink-200 rounded-full font-bold text-sm shadow-sm transition"
          >
            <span className="text-yellow-400">★</span> Rate BubuWish
          </button>
          
          <div className="flex bg-white/60 backdrop-blur-sm p-1.5 rounded-full border border-white/50 shadow-sm w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex-1 px-6 py-2 rounded-full font-bold text-sm transition ${activeTab === 'cards' ? themeStyle.text + ' bg-white shadow-md border-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              My Cards
            </button>
            <button
               onClick={() => setActiveTab('contacts')}
               className={`flex-1 px-6 py-2 rounded-full font-bold text-sm transition ${activeTab === 'contacts' ? themeStyle.text + ' bg-white shadow-md border-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Contacts & Birthdays
            </button>
          </div>
        </div>
      </div>

      {isReviewOpen && (
        <ReviewForm onClose={() => setIsReviewOpen(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirmOpen(false)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-gray-900 text-center mb-3">Delete This Card?</h3>
            
            {/* Description */}
            <p className="text-gray-600 text-center mb-8 font-medium leading-relaxed">
              Are you sure you want to delete this magic card? This action cannot be undone and the card link will no longer work.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setCardToDelete(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-200/50 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Contact Confirmation Modal */}
      {deleteContactConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteContactConfirmOpen(false)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-gray-900 text-center mb-3">Delete This Contact?</h3>
            
            {/* Description */}
            <p className="text-gray-600 text-center mb-8 font-medium leading-relaxed">
              Are you sure you want to delete this contact? All birthday reminders for this person will be removed.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteContactConfirmOpen(false);
                  setContactToDelete(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteContact}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-200/50 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {nextBirthdayData && (
        <div className="bg-pink-100 border border-pink-200 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white text-2xl shadow-sm shrink-0">
              🎂
            </div>
            <div>
              <h3 className="text-pink-900 font-bold">Upcoming Birthday!</h3>
              <p className="text-pink-700 text-sm font-medium">
                <span className="font-bold">{nextBirthdayData.contact.name}'s</span> birthday is {nextBirthdayData.days === 0 ? "today!" : `in ${nextBirthdayData.days} day${nextBirthdayData.days !== 1 ? 's' : ''}.`}
              </p>
            </div>
          </div>
          <button 
             onClick={startCreateNewCard}
             className="w-full sm:w-auto px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-sm transition text-sm whitespace-nowrap"
          >
            Create Magic Card
          </button>
        </div>
      )}

      {activeTab === 'cards' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm p-1.5 rounded-full border border-white/50 shadow-sm w-full sm:w-auto overflow-x-auto custom-scrollbar">
                {['classic', 'birthday', 'adventure', 'more'].map(th => (
                  <button
                    key={th}
                    onClick={() => setDashboardTheme(th)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${
                      dashboardTheme === th ? themeStyle.button + " text-white shadow-md" : 'text-gray-500 hover:bg-white/80'
                    }`}
                  >
                    {th === 'more' ? 'More Styles' : th}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={startCreateNewCard}
              className={`w-full sm:w-auto px-6 py-3 ${themeStyle.button} text-white rounded-full shadow-md transition font-bold whitespace-nowrap`}
            >
              + Create New Card
            </button>
          </div>

          {isLoadingWishes ? (
            // Loading skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 rounded-2xl p-5 border border-white shadow-sm animate-pulse">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : wishes.length === 0 ? (
            <div className="bg-white/80 rounded-3xl p-6 sm:p-12 text-center border border-pink-100 shadow-sm mt-4">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No cards yet</h3>
              <p className="text-gray-500 mb-6 font-medium text-sm sm:text-base">You haven't created any magic cards. Create your first one!</p>
              <button 
                onClick={startCreateNewCard}
                className={`w-full sm:w-auto px-6 py-2.5 ${themeStyle.text} bg-white border border-transparent hover:border-gray-200 rounded-full font-bold transition`}
              >
                Create Your First Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {wishes.map((wish: any) => (
                  <div key={wish.id} className="bg-white/80 rounded-2xl p-5 border border-white max-w-full shadow-sm flex flex-col hover:shadow-md transition">
                   <div className="flex justify-between items-center mb-4">
                      <span className={`text-xs font-bold ${themeStyle.text} bg-white/50 px-2.5 py-1 rounded-full uppercase`}>Card For {wish.recipient}</span>
                      <span className="text-xs text-gray-400 font-medium">{new Date(wish.createdAt).toLocaleDateString()}</span>
                   </div>
                   <p className="text-gray-700 mb-6 font-medium line-clamp-3 italic">"{wish.message}"</p>
                   <div className="mt-auto flex flex-col gap-2">
                     <div className="flex gap-2">
                       <button 
                         onClick={(e) => handleCopyLink(wish.id, e)}
                         className={`flex-1 py-2.5 ${themeStyle.button} text-white rounded-xl font-bold text-sm transition shadow-sm`}
                       >
                          Copy Link
                       </button>
                       <a 
                         href={`/card?id=${wish.id}`}
                         target="_blank"
                         rel="noreferrer"
                         className={`flex-1 py-2.5 bg-white ${themeStyle.text} border border-transparent hover:border-gray-200 rounded-xl font-bold text-sm transition text-center`}
                       >
                          View
                       </a>
                     </div>
                     <div className="flex gap-2 w-full">
                       <button 
                         onClick={() => startEditCard(wish)}
                         className="flex-1 py-2 text-gray-500 hover:text-white hover:bg-gray-500 rounded-xl font-bold text-xs transition border border-gray-200"
                       >
                          Edit
                       </button>
                       <button 
                         onClick={(e) => handleDelete(wish.id, e)}
                         className="flex-1 py-2 text-red-500 hover:text-white hover:bg-red-500 rounded-xl font-bold text-xs transition border border-red-200"
                       >
                          Delete
                       </button>
                     </div>
                   </div>
                 </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'contacts' && (
        <div className="mt-4">
           {!isAddingContact ? (
             <div className="space-y-6">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 w-full sm:max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search contacts by name or email..."
                        value={contactSearchQuery}
                        onChange={(e) => setContactSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition shadow-sm font-medium"
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAddingContact(true)}
                    className={`w-full sm:w-auto px-6 py-3 ${themeStyle.button} text-white rounded-full font-bold shadow-md transition whitespace-nowrap`}
                  >
                    + Add Contact
                  </button>
               </div>

               {/* Filters */}
               <div className="flex flex-wrap gap-3 items-center">
                 <button
                   onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                   className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                     showFavoritesOnly 
                       ? 'bg-yellow-500 text-white shadow-md' 
                       : 'bg-white/60 text-gray-600 hover:bg-white border border-white/50'
                   }`}
                 >
                   ⭐ {showFavoritesOnly ? 'Favorites Only' : 'Show All'}
                 </button>

                 <div className="flex bg-white/60 backdrop-blur-sm rounded-full border border-white/50 p-1 gap-1">
                   {['all', 'family', 'friend', 'colleague', 'partner'].map(rel => (
                     <button
                       key={rel}
                       onClick={() => setRelationshipFilter(rel)}
                       className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                         relationshipFilter === rel
                           ? themeStyle.button + ' text-white shadow-sm'
                           : 'text-gray-600 hover:bg-white/80'
                       }`}
                     >
                       {rel === 'all' ? 'All' : rel.charAt(0).toUpperCase() + rel.slice(1) + 's'}
                     </button>
                   ))}
                 </div>
               </div>
             </div>
           ) : (
             <form onSubmit={handleAddContact} className="bg-white/80 rounded-2xl p-6 shadow-sm border border-white mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{editingContact ? 'Edit Contact' : 'New Contact'}</h3>
                
                {/* Image Upload Section */}
                <div className="mb-6 flex flex-col items-center">
                  <div className="relative mb-3">
                    {contactImagePreview ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img src={contactImagePreview} alt="Contact" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                        {newContact.name ? newContact.name.charAt(0).toUpperCase() : '👤'}
                      </div>
                    )}
                    <label 
                      htmlFor="contact-image-upload" 
                      className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    <input
                      id="contact-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleContactImageUpload}
                      className="hidden"
                      disabled={uploadingContactImage}
                    />
                  </div>
                  {uploadingContactImage && (
                    <p className="text-sm text-pink-600 font-medium">Uploading image...</p>
                  )}
                  <p className="text-xs text-gray-500 text-center">Click camera icon to upload photo<br />(Max 5MB)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Name *</label>
                     <input 
                       type="text" 
                       required 
                       value={newContact.name} 
                       onChange={e => setNewContact({...newContact, name: e.target.value})} 
                       className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300" 
                       placeholder="John Doe" 
                     />
                  </div>
                  
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Birthday * (Month & Day)</label>
                     <input 
                       type="date" 
                       required 
                       value={newContact.birthday} 
                       onChange={e => setNewContact({...newContact, birthday: e.target.value})} 
                       className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300" 
                       placeholder="Select month and day"
                       title="Select birthday month and day (year will be ignored)"
                     />
                     <p className="text-xs text-gray-500 mt-1">Year is ignored - birthday repeats annually</p>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email <span className="text-gray-400 normal-case">(optional)</span></label>
                     <input 
                       type="email" 
                       value={newContact.email} 
                       onChange={e => setNewContact({...newContact, email: e.target.value})} 
                       className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300" 
                       placeholder="john@example.com" 
                     />
                  </div>
                  
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Relationship</label>
                     <select 
                       value={newContact.relationship} 
                       onChange={e => setNewContact({...newContact, relationship: e.target.value})}
                       className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                     >
                       <option value="family">👨‍👩‍👧‍👦 Family</option>
                       <option value="friend">🤝 Friend</option>
                       <option value="colleague">💼 Colleague</option>
                       <option value="partner">❤️ Partner</option>
                       <option value="other">👤 Other</option>
                     </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Notes <span className="text-gray-400 normal-case">(optional)</span></label>
                  <textarea
                    value={newContact.notes}
                    onChange={e => setNewContact({...newContact, notes: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[80px]"
                    placeholder="Gift preferences, favorite things, etc..."
                  />
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="favorite-checkbox"
                    checked={newContact.favorite}
                    onChange={e => setNewContact({...newContact, favorite: e.target.checked})}
                    className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-300"
                  />
                  <label htmlFor="favorite-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                    ⭐ Mark as favorite
                  </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={cancelContactForm} className="px-4 py-2 text-gray-500 font-bold hover:text-gray-800 transition">Cancel</button>
                  <button type="submit" disabled={uploadingContactImage} className={`px-6 py-2 ${themeStyle.button} text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50`}>
                    {editingContact ? 'Update Contact' : 'Save Contact'}
                  </button>
                </div>
             </form>
           )}

           {filteredContacts.length === 0 && !isAddingContact ? (
             <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-white mt-6">
                {contactSearchQuery ? (
                  <>
                    <div className="text-4xl mb-3">🔍</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No contacts found</h3>
                    <p className="text-gray-500 font-medium">No contacts match your search "{contactSearchQuery}"</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No contacts yet</h3>
                    <p className="text-gray-500 font-medium">Add contacts and we'll send you email reminders when their birthdays are coming up!</p>
                  </>
                )}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {filteredContacts.map(c => {
                   const days = daysUntilBirthday(c.birthday);
                   const age = calculateAge(c.birthday);
                   const zodiac = getZodiacSign(c.birthday);
                   const milestone = getMilestoneBadge(c.birthday);
                   
                   return (
                     <div key={c.id} className="bg-white/80 rounded-2xl p-5 shadow-sm border border-white hover:shadow-md transition group relative">
                        {/* Favorite Star */}
                        <button
                          onClick={() => toggleFavorite(c.id, c.favorite)}
                          className="absolute top-3 right-3 text-2xl transition-transform hover:scale-125"
                        >
                          {c.favorite ? '⭐' : '☆'}
                        </button>

                        {/* Milestone Badge */}
                        {milestone && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                            🎊 {milestone}
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-3 mt-8">
                          <div className="flex items-center gap-3">
                            {c.imageUrl ? (
                              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-300 shadow-md flex-shrink-0">
                                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                {c.name}
                                {c.relationship && (
                                  <span className="text-sm">{getRelationshipEmoji(c.relationship)}</span>
                                )}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{age} years</span>
                                <span>•</span>
                                <span title={zodiac.dates}>{zodiac.emoji} {zodiac.name}</span>
                              </div>
                              {c.email && <p className="text-xs text-gray-500 font-medium mt-0.5">{c.email}</p>}
                            </div>
                          </div>
                        </div>
                        
                        {/* Notes Preview */}
                        {c.notes && (
                          <div className="mb-3 bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-gray-600 italic line-clamp-2">{c.notes}</p>
                          </div>
                        )}

                        {/* Birthday Info */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 bg-pink-50 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-xl">🎂</span>
                              <div>
                                <p className="font-bold text-pink-600 text-xs">
                                  {new Date(c.birthday).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                </p>
                                <p className="text-gray-600 text-xs font-medium">
                                  {days === 0 ? (
                                    <span className="text-orange-600 font-bold">🎉 Today!</span>
                                  ) : days === 1 ? (
                                    <span className="text-orange-600 font-bold">Tomorrow!</span>
                                  ) : days <= 7 ? (
                                    <span className="text-orange-500 font-bold">in {days} days 🔥</span>
                                  ) : (
                                    <span>in {days} days</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditContact(c)}
                            className="flex-1 py-2 text-gray-600 hover:text-white hover:bg-gray-500 rounded-xl font-bold text-xs transition border border-gray-200 flex items-center justify-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteContact(c.id)}
                            className="flex-1 py-2 text-red-500 hover:text-white hover:bg-red-500 rounded-xl font-bold text-xs transition border border-red-200 flex items-center justify-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                     </div>
                   );
                })}
             </div>
           )}
        </div>
      )}
      </div>
    </div>
  );
}
