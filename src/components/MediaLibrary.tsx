import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Search, Image as ImageIcon, Music, Trash2, Edit2, Check, X as XIcon, Play, Pause, Loader2, Download, Calendar, HardDrive, Video } from 'lucide-react';
import { useAuth } from '../App';
import { useToast } from './ui/ToastProvider';
import { cn } from '../lib/utils';
import { fetchWithCsrf } from '../hooks/useCsrf';

interface MediaItem {
  id: string;
  userId: string;
  mediaType: 'image' | 'audio' | 'video';
  mediaUrl: string;
  publicId: string | null;
  fileName: string | null;
  fileSize: string | null;
  mimeType: string | null;
  thumbnail: string | null;
  duration: string | null;
  usageCount: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  filterType?: 'all' | 'image' | 'audio' | 'video';
  theme?: 'pink' | 'blue' | 'purple' | 'green' | 'orange';
}

// Theme configurations
const THEMES = {
  pink: {
    gradient: 'from-pink-500 via-purple-500 to-indigo-500',
    allFilter: 'from-pink-500 to-purple-500',
    imageFilter: 'from-blue-500 to-cyan-500',
    audioFilter: 'from-purple-500 to-pink-500',
    videoFilter: 'from-orange-500 to-red-500',
    imageBg: 'from-blue-100 to-cyan-100',
    audioBg: 'from-purple-100 to-pink-100',
    videoBg: 'from-orange-100 to-red-100',
    imageIcon: 'from-blue-500 to-cyan-500',
    audioIcon: 'from-purple-500 to-pink-500',
    videoIcon: 'from-orange-500 to-red-500',
  },
  blue: {
    gradient: 'from-blue-600 via-cyan-500 to-teal-500',
    allFilter: 'from-blue-500 to-cyan-500',
    imageFilter: 'from-indigo-500 to-blue-500',
    audioFilter: 'from-cyan-500 to-teal-500',
    videoFilter: 'from-blue-600 to-indigo-600',
    imageBg: 'from-indigo-100 to-blue-100',
    audioBg: 'from-cyan-100 to-teal-100',
    videoBg: 'from-blue-100 to-indigo-100',
    imageIcon: 'from-indigo-500 to-blue-500',
    audioIcon: 'from-cyan-500 to-teal-500',
    videoIcon: 'from-blue-600 to-indigo-600',
  },
  purple: {
    gradient: 'from-purple-600 via-fuchsia-500 to-pink-500',
    allFilter: 'from-purple-500 to-fuchsia-500',
    imageFilter: 'from-violet-500 to-purple-500',
    audioFilter: 'from-fuchsia-500 to-pink-500',
    videoFilter: 'from-purple-600 to-indigo-600',
    imageBg: 'from-violet-100 to-purple-100',
    audioBg: 'from-fuchsia-100 to-pink-100',
    videoBg: 'from-purple-100 to-indigo-100',
    imageIcon: 'from-violet-500 to-purple-500',
    audioIcon: 'from-fuchsia-500 to-pink-500',
    videoIcon: 'from-purple-600 to-indigo-600',
  },
  green: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    allFilter: 'from-emerald-500 to-teal-500',
    imageFilter: 'from-green-500 to-emerald-500',
    audioFilter: 'from-teal-500 to-cyan-500',
    videoFilter: 'from-emerald-600 to-green-600',
    imageBg: 'from-green-100 to-emerald-100',
    audioBg: 'from-teal-100 to-cyan-100',
    videoBg: 'from-emerald-100 to-green-100',
    imageIcon: 'from-green-500 to-emerald-500',
    audioIcon: 'from-teal-500 to-cyan-500',
    videoIcon: 'from-emerald-600 to-green-600',
  },
  orange: {
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    allFilter: 'from-orange-500 to-amber-500',
    imageFilter: 'from-amber-500 to-yellow-500',
    audioFilter: 'from-orange-500 to-red-500',
    videoFilter: 'from-red-500 to-rose-500',
    imageBg: 'from-amber-100 to-yellow-100',
    audioBg: 'from-orange-100 to-red-100',
    videoBg: 'from-red-100 to-rose-100',
    imageIcon: 'from-amber-500 to-yellow-500',
    audioIcon: 'from-orange-500 to-red-500',
    videoIcon: 'from-red-500 to-rose-500',
  },
};

export function MediaLibrary({ isOpen, onClose, onSelect, filterType = 'all' }: MediaLibraryProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'audio' | 'video'>(filterType);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Bulk Actions & Drag Drop
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDragActive, setIsDragActive] = useState(false);
  
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchMedia(1, true);
    }
  }, [isOpen, typeFilter]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        setPage(1);
        fetchMedia(1, true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMedia = async (pageNum = page, reset = false) => {
    if (!token) return;
    
    if (reset) setLoading(true);
    else setIsLoadingMore(true);
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '30'
      });
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/media-library?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch media');
      
      const data = await response.json();
      
      if (reset) {
        setMedia(data.media || []);
        setFilteredMedia(data.media || []);
      } else {
        setMedia(prev => [...prev, ...(data.media || [])]);
        setFilteredMedia(prev => [...prev, ...(data.media || [])]);
      }
      
      setHasMore(data.pagination?.hasMore || false);
      setPage(pageNum);
      
    } catch (error: any) {
      console.error('Error fetching media:', error);
      toast('Failed to load media library', 'error');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleUpload = async (files: FileList | null, type: 'image' | 'audio' | 'video') => {
    if (!files || !token) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Convert to array and process sequentially to show progress
    const fileArray = Array.from(files);
    let successCount = 0;
    
    try {
      // First get CSRF token
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/media-library');
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('X-CSRF-Token', csrfToken);
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const fileProgress = (event.loaded / event.total) * 100;
              // Calculate overall progress across multiple files
              const overallProgress = ((i * 100) + fileProgress) / fileArray.length;
              setUploadProgress(Math.round(overallProgress));
            }
          };
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              successCount++;
              resolve(xhr.response);
            } else {
              try {
                const error = JSON.parse(xhr.response);
                reject(new Error(error.error || 'Upload failed'));
              } catch {
                reject(new Error('Upload failed'));
              }
            }
          };
          
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.send(formData);
        });
      }
      
      if (successCount > 0) {
        toast(`${successCount} media file(s) uploaded successfully! 📤`, 'success');
        setPage(1);
        fetchMedia(1, true);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast(error.message || 'Failed to upload media', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setIsDragActive(false);
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    try {
      const response = await fetchWithCsrf('/api/media-library/bulk-delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ mediaIds: Array.from(selectedIds) }),
      });
      
      if (!response.ok) throw new Error('Bulk delete failed');
      
      toast(`Deleted ${selectedIds.size} items successfully`, 'success');
      setSelectedIds(new Set());
      setIsSelectMode(false);
      
      // Refresh
      setPage(1);
      fetchMedia(1, true);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast('Failed to delete selected media', 'error');
    }
  };
  
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const mime = file.type.toLowerCase();
      let type: 'image' | 'audio' | 'video' | null = null;
      
      if (mime.startsWith('image/')) type = 'image';
      else if (mime.startsWith('audio/')) type = 'audio';
      else if (mime.startsWith('video/')) type = 'video';
      
      if (type && (typeFilter === 'all' || typeFilter === type)) {
        handleUpload(e.dataTransfer.files, type);
      } else {
        toast(`Cannot upload this file type in the ${typeFilter} tab`, 'error');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetchWithCsrf(`/api/media-library/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      toast('Media deleted successfully', 'success');
      setDeleteConfirm(null);
      setPage(1);
      fetchMedia(1, true);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast('Failed to delete media', 'error');
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    
    try {
      const response = await fetchWithCsrf(`/api/media-library/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ fileName: editName }),
      });
      
      if (!response.ok) throw new Error('Rename failed');
      
      toast('Media renamed successfully', 'success');
      setEditingId(null);
      setEditName('');
      setPage(1);
      fetchMedia(1, true);
    } catch (error: any) {
      console.error('Rename error:', error);
      toast('Failed to rename media', 'error');
    }
  };

  const handleSelect = async (item: MediaItem) => {
    try {
      // Track usage
      await fetchWithCsrf(`/api/media-library/${item.id}/use`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      onSelect(item);
      onClose();
    } catch (error) {
      console.error('Error tracking usage:', error);
      // Still select even if tracking fails
      onSelect(item);
      onClose();
    }
  };

  const toggleAudioPlay = (url: string) => {
    if (playingAudio === url) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
      setPlayingAudio(url);
    }
  };

  const toggleVideoPlay = (url: string) => {
    setPlayingVideo(playingVideo === url ? null : url);
  };

  const formatFileSize = (bytes: string | null) => {
    if (!bytes) return 'Unknown';
    const size = parseInt(bytes);
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden mx-2 sm:mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Simple Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Media Library</h2>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {typeFilter === 'image' 
                    ? 'Manage your photos' 
                    : typeFilter === 'audio' 
                    ? 'Manage your audio' 
                    : typeFilter === 'video'
                    ? 'Manage your videos'
                    : 'Manage your photos and audio'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>

          {/* Bulk Actions Header (shows when select mode is active) */}
          <AnimatePresence>
            {isSelectMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-pink-50 border-b border-pink-100 overflow-hidden"
              >
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsSelectMode(false);
                        setSelectedIds(new Set());
                      }}
                      className="p-1.5 hover:bg-pink-100 rounded-lg text-pink-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-pink-700 text-sm">
                      {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newSelected = new Set<string>();
                        if (selectedIds.size < filteredMedia.length) {
                          filteredMedia.forEach(m => newSelected.add(m.id));
                        }
                        setSelectedIds(newSelected);
                      }}
                      className="px-3 py-1.5 bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 text-xs font-semibold rounded-lg transition-colors"
                    >
                      {selectedIds.size === filteredMedia.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={selectedIds.size === 0}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simple Toolbar */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-300 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Type Filters - Responsive Grid */}
              <div className="grid grid-cols-4 sm:flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={cn(
                    "px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap",
                    typeFilter === 'all'
                      ? "bg-pink-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <span className="hidden sm:inline">All</span>
                  <span className="sm:hidden">All</span>
                </button>
                <button
                  onClick={() => setTypeFilter('image')}
                  className={cn(
                    "px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap",
                    typeFilter === 'image'
                      ? "bg-pink-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Photos</span>
                </button>
                <button
                  onClick={() => setTypeFilter('audio')}
                  className={cn(
                    "px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap",
                    typeFilter === 'audio'
                      ? "bg-pink-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Music className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Audio</span>
                </button>
                <button
                  onClick={() => setTypeFilter('video')}
                  className={cn(
                    "px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap",
                    typeFilter === 'video'
                      ? "bg-pink-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Videos</span>
                </button>
                <button
                  onClick={() => setIsSelectMode(!isSelectMode)}
                  className={cn(
                    "px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap ml-auto",
                    isSelectMode ? "bg-pink-100 text-pink-700 border-pink-200 border" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{isSelectMode ? 'Cancel Select' : 'Select'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simple Media Grid */}
          <div 
            className={cn(
              "flex-1 overflow-y-auto p-3 sm:p-6 transition-colors", 
              isDragActive ? "bg-pink-50 border-2 border-dashed border-pink-300 inset-4" : "bg-gray-50"
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {isDragActive && (
              <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl border-4 border-dashed border-pink-400">
                <Upload className="w-16 h-16 text-pink-500 animate-bounce mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Drop files here</h2>
                <p className="text-gray-500 mt-2">Upload image, audio, or video</p>
              </div>
            )}
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-pink-600 animate-spin mb-3" />
                <p className="text-gray-500 text-xs sm:text-sm font-medium">Loading your media...</p>
              </div>
            ) : uploading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-pink-600 animate-pulse mb-3" />
                <p className="text-gray-500 text-xs sm:text-sm font-medium mb-4">Uploading... {uploadProgress}%</p>
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4">
                {/* Simple Empty State */}
                <div className="text-center max-w-md w-full">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-2">No media found</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6">
                    Upload {typeFilter === 'image' ? 'photos' : typeFilter === 'audio' ? 'audio' : typeFilter === 'video' ? 'videos' : 'media'} to get started
                  </p>

                  {/* Simple Upload Cards - Always show the relevant upload button */}
                  <div className={cn("grid gap-4 mt-8", typeFilter === 'all' ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1")}>
                    {typeFilter === 'all' && (
                      <>
                        <label className="cursor-pointer group">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleUpload(e.target.files, 'image')}
                            disabled={uploading}
                          />
                          <div className="p-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-pink-300 hover:bg-pink-50/50 transition-all text-center">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-pink-600 mx-auto mb-3 transition-colors" />
                            <h4 className="font-bold text-gray-700 mb-1">Upload Photos</h4>
                            <p className="text-xs text-gray-500">JPG, PNG, WebP (Max 5MB)</p>
                          </div>
                        </label>
                        <label className="cursor-pointer group">
                          <input
                            type="file"
                            accept="audio/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleUpload(e.target.files, 'audio')}
                            disabled={uploading}
                          />
                          <div className="p-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-pink-300 hover:bg-pink-50/50 transition-all text-center">
                            <Music className="w-8 h-8 text-gray-400 group-hover:text-pink-600 mx-auto mb-3 transition-colors" />
                            <h4 className="font-bold text-gray-700 mb-1">Upload Audio</h4>
                            <p className="text-xs text-gray-500">MP3, WAV, WebM (Max 10MB)</p>
                          </div>
                        </label>
                        <label className="cursor-pointer group">
                          <input
                            type="file"
                            accept="video/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleUpload(e.target.files, 'video')}
                            disabled={uploading}
                          />
                          <div className="p-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-pink-300 hover:bg-pink-50/50 transition-all text-center">
                            <Video className="w-8 h-8 text-gray-400 group-hover:text-pink-600 mx-auto mb-3 transition-colors" />
                            <h4 className="font-bold text-gray-700 mb-1">Upload Video</h4>
                            <p className="text-xs text-gray-500">MP4, WebM, OGG (Max 50MB)</p>
                          </div>
                        </label>
                      </>
                    )}
                    {typeFilter === 'image' && (
                      <label className="cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleUpload(e.target.files, 'image')}
                          disabled={uploading}
                        />
                        <div className="p-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-pink-300 hover:bg-pink-50/50 transition-all text-center">
                          <Upload className="w-12 h-12 text-gray-400 group-hover:text-pink-600 mx-auto mb-4 transition-colors" />
                          <h4 className="text-lg font-bold text-gray-700 mb-2">Upload Photos</h4>
                          <p className="text-sm text-gray-500">JPG, PNG, WebP, GIF (Max 5MB)</p>
                        </div>
                      </label>
                    )}
                    {typeFilter === 'audio' && (
                      <label className="cursor-pointer group">
                        <input
                          type="file"
                          accept="audio/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleUpload(e.target.files, 'audio')}
                          disabled={uploading}
                        />
                        <div className="p-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-pink-300 hover:bg-pink-50/50 transition-all text-center">
                          <Music className="w-12 h-12 text-gray-400 group-hover:text-pink-600 mx-auto mb-4 transition-colors" />
                          <h4 className="text-lg font-bold text-gray-700 mb-2">Upload Audio</h4>
                          <p className="text-sm text-gray-500">MP3, WAV, WebM, OGG (Max 10MB)</p>
                        </div>
                      </label>
                    )}
                    {typeFilter === 'video' && (
                      <label className="cursor-pointer group">
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleUpload(e.target.files, 'video')}
                          disabled={uploading}
                        />
                        <div className="p-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-pink-300 hover:bg-pink-50/50 transition-all text-center">
                          <Video className="w-12 h-12 text-gray-400 group-hover:text-pink-600 mx-auto mb-4 transition-colors" />
                          <h4 className="text-lg font-bold text-gray-700 mb-2">Upload Video</h4>
                          <p className="text-sm text-gray-500">MP4, WebM, OGG, MOV (Max 50MB)</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredMedia.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "group relative bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer border",
                      isSelectMode && selectedIds.has(item.id) ? "border-pink-500 ring-2 ring-pink-500 ring-offset-2" : "border-gray-200 hover:border-pink-400"
                    )}
                    onClick={(e) => {
                      if (isSelectMode) {
                        e.preventDefault();
                        const newSet = new Set(selectedIds);
                        if (newSet.has(item.id)) newSet.delete(item.id);
                        else newSet.add(item.id);
                        setSelectedIds(newSet);
                      } else {
                        handleSelect(item);
                      }
                    }}
                  >
                    {/* Media Preview with Enhanced Styling */}
                    <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                      {isSelectMode && (
                        <div className="absolute top-3 left-3 z-20">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm",
                            selectedIds.has(item.id) ? "bg-pink-500 border-pink-500 text-white" : "bg-white/80 border-gray-400 backdrop-blur-sm"
                          )}>
                            {selectedIds.has(item.id) && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      )}
                      {item.mediaType === 'image' ? (
                        <>
                          <img
                            src={item.mediaUrl}
                            alt={item.fileName || 'Image'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </>
                      ) : item.mediaType === 'video' ? (
                        <div className="w-full h-full relative">
                          {item.thumbnail ? (
                            <>
                              <img
                                src={item.thumbnail}
                                alt={item.fileName || 'Video'}
                                className="w-full h-full object-cover"
                              />
                              <div 
                                className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleVideoPlay(item.mediaUrl);
                                }}
                              >
                                <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                  <Play className="w-8 h-8 text-white ml-1" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 relative h-full">
                              <div className="absolute inset-0 bg-linear-to-br from-orange-100 to-red-100"></div>
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                                  <Video className="w-8 h-8 text-white" />
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleVideoPlay(item.mediaUrl);
                                  }}
                                  className="p-3 bg-white hover:bg-linear-to-r hover:from-orange-500 hover:to-red-500 text-orange-500 hover:text-white rounded-full transition-all shadow-lg hover:shadow-xl group/play"
                                >
                                  {playingVideo === item.mediaUrl ? (
                                    <Pause className="w-5 h-5" />
                                  ) : (
                                    <Play className="w-5 h-5 group-hover/play:scale-110 transition-transform" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 relative">
                          <div className="absolute inset-0 bg-linear-to-br from-purple-100 to-pink-100"></div>
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                              <Music className="w-8 h-8 text-white" />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAudioPlay(item.mediaUrl);
                              }}
                              className="p-3 bg-white hover:bg-linear-to-r hover:from-purple-500 hover:to-pink-500 text-purple-500 hover:text-white rounded-full transition-all shadow-lg hover:shadow-xl group/play"
                            >
                              {playingAudio === item.mediaUrl ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5 group-hover/play:scale-110 transition-transform" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Usage Badge with Enhanced Design */}
                      {parseInt(item.usageCount) > 0 && (
                        <div className="absolute top-3 right-3 bg-linear-to-r from-pink-500 to-purple-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <span>{item.usageCount}×</span>
                        </div>
                      )}

                      {/* Selection Indicator (when not in select mode) */}
                      {!isSelectMode && (
                        <div className="absolute inset-0 border-4 border-pink-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      )}
                    </div>

                    {/* Enhanced Info Section */}
                    <div className="p-2 sm:p-3 bg-white">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border-2 border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRename(item.id)}
                            className="p-1.5 sm:p-2 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditName('');
                            }}
                            className="p-1.5 sm:p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <XIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs sm:text-sm font-bold text-gray-800 truncate mb-1">
                            {item.fileName || 'Untitled'}
                          </p>
                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <HardDrive className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {formatFileSize(item.fileSize)}
                            </span>
                            <span className="hidden sm:flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1.5 sm:gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditName(item.fileName || '');
                        }}
                        className="p-1.5 sm:p-2.5 bg-white/95 hover:bg-blue-500 hover:text-white rounded-lg sm:rounded-xl shadow-lg transition-all hover:scale-110"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ id: item.id, name: item.fileName || 'this media' })}
                        className="p-1.5 sm:p-2.5 bg-white/95 hover:bg-red-500 hover:text-white rounded-lg sm:rounded-xl shadow-lg transition-all hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Click to Select Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 sm:pb-4 pointer-events-none">
                      <div className="bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg font-bold text-xs sm:text-sm text-pink-600">
                        Click to Select
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Load More Button */}
            {!loading && hasMore && (
              <div className="flex justify-center mt-8 pb-4">
                <button
                  onClick={() => fetchMedia(page + 1)}
                  disabled={isLoadingMore}
                  className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-pink-300 rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Audio Player (hidden) */}
          <audio
            ref={audioRef}
            onEnded={() => setPlayingAudio(null)}
            className="hidden"
          />
        </motion.div>

        {/* Video Player Modal */}
        <AnimatePresence>
          {playingVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
              onClick={() => setPlayingVideo(null)}
            >
              <button 
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                onClick={() => setPlayingVideo(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-4xl max-h-[80vh] bg-black rounded-2xl overflow-hidden shadow-2xl relative"
                onClick={e => e.stopPropagation()}
              >
                <video
                  src={playingVideo}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  onEnded={() => setPlayingVideo(null)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full shadow-2xl mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Delete Media?</h3>
                    <p className="text-xs sm:text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 bg-gray-50 p-3 rounded-lg">
                  Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirm.name}"</span>?
                </p>
                
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.id)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );

  // Use Portal to render outside of parent component
  return createPortal(modalContent, document.body);
}
