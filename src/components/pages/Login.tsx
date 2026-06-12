import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { MessageCircleHeart, LogIn, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../ui/ToastProvider';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetCode, setResetCode] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      // Check if email is not verified
      if (res.status === 403 && data.verified === false) {
        toast('📧 Please verify your email first', 'error');
        setError(data.error || 'Please verify your email before logging in');
        // Store email and redirect to verification page
        localStorage.setItem('pendingVerificationEmail', email);
        setTimeout(() => {
          navigate('/verify-email', { state: { email } });
        }, 1500);
        return;
      }
      
      if (!res.ok) throw new Error(data.error || 'Failed to login');
      
      login(data.token, data.user);
      toast('Login Successful!', 'success');
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process request');
      toast(data.message || 'If an account exists, an email was sent.', 'info');
      setView('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: resetCode, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      toast('Password updated successfully! You can now log in.', 'success');
      setView('login');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#FFF0F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans font-medium relative overflow-hidden">
      <div className="absolute top-0 w-full p-6">
        <Link to="/" className="flex items-center gap-2">
          <MessageCircleHeart className="w-8 h-8 text-pink-500" />
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-400">BubuWish</span>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-4 sm:px-0 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <h2 className="mt-6 text-center text-3xl font-black text-gray-900 tracking-tight">
          {view === 'login' && 'Welcome back'}
          {view === 'forgot' && 'Reset Password'}
          {view === 'reset' && 'Enter New Password'}
        </h2>
        {view === 'login' ? (
          <p className="mt-2 text-center text-sm text-pink-600">
            Or <Link to="/signup" className="font-bold text-pink-500 hover:text-pink-400">create a new account</Link>
          </p>
        ) : (
          <button onClick={() => setView('login')} className="w-full mt-2 text-center text-sm font-bold text-pink-500 hover:text-pink-400">
            Back to login
          </button>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 w-full px-4 sm:px-0 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl sm:px-10 border border-white">
          <form className="space-y-6" onSubmit={view === 'login' ? handleLoginSubmit : view === 'forgot' ? handleForgotSubmit : handleResetSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 font-bold p-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
            
            {(view === 'login' || view === 'forgot' || view === 'reset') && (
              <div>
                <label className="block text-sm font-bold text-gray-700">Email address</label>
                <div className="mt-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={view === 'reset'}
                    className="appearance-none block w-full px-4 py-3 border border-pink-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium bg-white/50 backdrop-blur-sm transition disabled:opacity-50"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            )}

            {view === 'reset' && (
              <div>
                <label className="block text-sm font-bold text-gray-700">6-Digit Reset Code</label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value)}
                    maxLength={6}
                    className="appearance-none block w-full px-4 py-3 border border-pink-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium bg-white/50 backdrop-blur-sm transition"
                    placeholder="123456"
                  />
                </div>
              </div>
            )}

            {(view === 'login' || view === 'reset') && (
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-gray-700">
                    {view === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {view === 'login' && (
                    <button type="button" onClick={() => setView('forgot')} className="text-sm font-bold text-pink-500 hover:text-pink-400">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-pink-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium bg-white/50 backdrop-blur-sm transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition disabled:opacity-70 flex gap-2 items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                 view === 'login' ? <><LogIn className="w-5 h-5" /> Sign in</> :
                 view === 'forgot' ? 'Send Reset Code' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
