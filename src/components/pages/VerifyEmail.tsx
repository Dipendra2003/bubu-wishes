import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircleHeart, Mail, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../ui/ToastProvider';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get email from navigation state or localStorage
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail') || '';

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/verify-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      
      setVerified(true);
      toast('🎉 Email verified successfully!', 'success');
      localStorage.removeItem('pendingVerificationEmail');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Email verified! You can now login.' }
        });
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);
    
    try {
      const res = await fetch('/api/auth/resend-verification-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }
      
      toast('✉️ New verification code sent!', 'success');
      setCode(''); // Clear the input
    } catch (err: any) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="flex-1 w-full bg-[#FFF0F5] flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 font-sans font-medium">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Verified!</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[#FFF0F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans font-medium relative overflow-hidden">
      <div className="absolute top-0 w-full p-6">
        <Link to="/" className="flex items-center gap-2">
          <MessageCircleHeart className="w-8 h-8 text-pink-500" />
          <span className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-pink-600 to-rose-400">BubuWish</span>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-4 sm:px-0 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-pink-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Verify Your Email
          </h2>
          <p className="mt-3 text-sm text-gray-600 max-w-sm mx-auto">
            We've sent a 6-digit verification code to <span className="font-bold text-pink-600">{email}</span>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Check your inbox and enter the code below
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 w-full px-4 sm:px-0 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl sm:px-10 border border-white">
          <form className="space-y-6" onSubmit={handleVerify}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 text-red-600 font-bold p-3 rounded-xl text-sm text-center"
              >
                {error}
              </motion.div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 text-center mb-2">
                Enter 6-Digit Code
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="appearance-none block w-full px-4 py-4 border border-pink-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-bold text-center text-2xl tracking-[0.5em] bg-white/50 backdrop-blur-sm transition"
                  placeholder="● ● ● ● ● ●"
                  autoFocus
                />
              </div>
              <p className="mt-2 text-xs text-center text-gray-500">
                Code expires in 15 minutes
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed gap-2 items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Verify Email
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500 font-bold">Didn't receive code?</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full flex justify-center py-3 px-4 border-2 border-pink-200 rounded-xl text-sm font-bold text-pink-600 bg-white hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition disabled:opacity-50 gap-2 items-center"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend Code
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-4">
              <Link 
                to="/signup" 
                className="text-sm font-bold text-gray-500 hover:text-pink-500 transition"
              >
                ← Back to Signup
              </Link>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-32 h-32 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>
  );
}
