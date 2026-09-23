import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircleHeart, ArrowLeft } from 'lucide-react';

export default function StaticPage({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="flex-1 relative font-sans flex flex-col bg-[#FFF0F5] w-full overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#FFD1DC] rounded-full blur-[140px] opacity-50 pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-[#B0E0E6] rounded-full blur-[140px] opacity-50 pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] bg-[#E8D5F5] rounded-full blur-[120px] opacity-30 pointer-events-none z-0"></div>

      {/* Hero Banner */}
      <div className="relative z-10 w-full bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-yellow-300/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
          {/* Top nav */}
          <nav className="pt-4 sm:pt-6 pb-4 flex items-center justify-between relative z-20">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:bg-white/30 transition">
                <MessageCircleHeart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-black text-white">
                BubuWish
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 font-bold text-sm">
              <Link to="/" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-white/80 hover:text-white transition rounded-full hover:bg-white/10">
                <ArrowLeft className="w-4 h-4" /> Home
              </Link>
              <Link to="/login" className="px-3 py-2 text-white/80 hover:text-white transition rounded-full hover:bg-white/10">Log In</Link>
              <Link to="/signup" className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-pink-600 hover:bg-pink-50 rounded-full shadow-lg transition transform hover:-translate-y-0.5 font-bold">
                Sign Up
              </Link>
            </div>
          </nav>

          {/* Hero title */}
          <motion.div
            className="pb-10 sm:pb-14 pt-4 sm:pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-bold mb-4 transition sm:hidden">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-display">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-base sm:text-lg text-white/80 font-medium max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8">
          <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0 48h1440V16C1200 40 960 0 720 16S240 48 0 16v32z" fill="#FFF0F5" />
          </svg>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 relative z-10 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full"
        >
          <div className="text-gray-700 font-medium leading-relaxed">
            {children}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 sm:py-10 bg-white/60 backdrop-blur-sm z-10 mt-auto border-t border-pink-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="bg-pink-100 rounded-full p-1.5">
              <MessageCircleHeart className="w-4 h-4 text-pink-500" />
            </div>
            <span className="text-base font-black text-gray-800">BubuWish</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold text-gray-500">
            <Link to="/about" className="hover:text-pink-500 transition">About</Link>
            <Link to="/contact" className="hover:text-pink-500 transition">Contact</Link>
            <Link to="/faq" className="hover:text-pink-500 transition">FAQ</Link>
            <Link to="/privacy" className="hover:text-pink-500 transition">Privacy</Link>
            <Link to="/terms" className="hover:text-pink-500 transition">Terms</Link>
          </div>
          <p className="text-xs sm:text-sm text-gray-400">&copy; {new Date().getFullYear()} BubuWish Magic Cards.</p>
        </div>
      </footer>
    </div>
  );
}
