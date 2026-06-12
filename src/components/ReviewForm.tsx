import React, { useState } from 'react';
import { useAuth } from '../App';
import { useToast } from './ui/ToastProvider';

interface ReviewFormProps {
  onClose: () => void;
}

export function ReviewForm({ onClose }: ReviewFormProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      if (res.ok) {
        toast('Thank you for your review!', 'success');
        onClose();
      } else {
         const data = await res.json();
         toast(data.error || 'Failed to submit review', 'error');
      }
    } catch(e) {
      toast('Failed to submit review', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
         <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
           ✕
         </button>
         <h2 className="text-2xl font-black text-gray-900 mb-2">Enjoying BubuWish?</h2>
         <p className="text-gray-500 font-medium mb-6">Leave a review to be featured on our front page!</p>
         <form onSubmit={handleSubmitReview}>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                 <button 
                   key={star} 
                   type="button"
                   onClick={() => setReviewRating(star)}
                   className={`text-3xl transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-200'}`}
                 >
                   ★
                 </button>
              ))}
            </div>
            <textarea 
               required
               value={reviewComment}
               onChange={e => setReviewComment(e.target.value)}
               className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[100px] mb-6 resize-none"
               placeholder="Tell us what you love..."
            />
            <button 
              type="submit" 
              disabled={reviewLoading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
         </form>
      </div>
    </div>
  );
}
