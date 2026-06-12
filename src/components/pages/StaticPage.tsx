import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MessageCircleHeart } from 'lucide-react';

export default function StaticPage({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="flex-1 relative font-sans flex flex-col bg-[#FFF0F5] w-full overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFD1DC] rounded-full blur-[120px] opacity-60 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#B0E0E6] rounded-full blur-[120px] opacity-60 pointer-events-none z-0"></div>
      
      {/* Navigation */}
      <nav className="p-4 sm:p-6 w-full max-w-7xl mx-auto flex items-center justify-between relative z-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-pink-500 rounded-full p-2">
            <MessageCircleHeart className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-400">
            BubuWish
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 font-bold text-sm sm:text-base">
          <Link to="/login" className="px-2 sm:px-4 py-2 text-pink-600 hover:text-pink-700 transition">Log In</Link>
          <Link to="/signup" className="px-4 py-2 sm:px-6 sm:py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg shadow-pink-200 transition transform hover:-translate-y-0.5">
            Sign Up
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl w-full mx-auto px-4 py-8 sm:py-24 relative z-10 flex-1 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-12 border border-white"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-400 mb-8 pb-2 tracking-tight">
            {title}
          </h1>
          <div className="text-gray-700 font-medium leading-relaxed space-y-6">
            {children}
          </div>
        </motion.div>
      </div>

      <footer className="w-full py-6 sm:py-8 text-center text-pink-600/70 font-bold bg-white/40 backdrop-blur-sm z-10 mt-auto border-t border-white shadow-[0_-4px_20px_rgba(255,192,203,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} BubuWish Magic Cards.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link to="/about" className="hover:text-pink-500 transition">About</Link>
            <Link to="/contact" className="hover:text-pink-500 transition">Contact</Link>
            <Link to="/faq" className="hover:text-pink-500 transition">FAQ</Link>
            <Link to="/privacy" className="hover:text-pink-500 transition">Privacy</Link>
            <Link to="/terms" className="hover:text-pink-500 transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
