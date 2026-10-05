import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircleHeart, LogOut, LayoutDashboard, User, Menu, X, Info, Mail } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (['/', '/login', '/signup', '/about', '/privacy', '/terms', '/contact', '/faq', '/card'].includes(location.pathname)) {
    return null; // Landing/auth/static/card pages have custom headers or full-screen view
  }

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white/60 backdrop-blur-md border-b border-pink-100 z-40 fixed top-0 left-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-pink-500 rounded-full p-1.5 flex items-center justify-center">
                  <MessageCircleHeart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black bg-clip-text text-transparent bg-linear-to-r from-pink-600 to-rose-400">
                  BubuWish
                </span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Public Navigation */}
              <div className="hidden md:flex items-center">
                <Link to="/about" className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-pink-600 transition">About</Link>
                <Link to="/contact" className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-pink-600 transition">Contact</Link>
              </div>

              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  {/* Desktop User Navigation */}
                  <span className="text-sm font-bold text-gray-600 px-2 border-l border-gray-200">Hello, {user.name}</span>
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 border-l border-gray-200 pl-4">
                  <Link to="/login" className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-pink-600 transition">Login</Link>
                  <Link to="/signup" className="px-4 py-2 text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-full transition shadow-sm">Sign Up</Link>
                </div>
              )}

              {/* Mobile Menu Toggle (Always visible on mobile) */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-md text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16 w-full shrink-0 hidden md:block"></div>
      <div className="h-16 w-full shrink-0 md:hidden"></div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div 
        className={`fixed top-0 right-0 w-64 h-full bg-white/95 backdrop-blur-xl border-l border-pink-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-end">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 py-4 flex flex-col gap-6 flex-1">
          {user && (
            <div className="flex flex-col gap-2 border-b border-pink-50 pb-6">
              <span className="text-sm font-bold text-gray-500">Logged in as</span>
              <span className="text-lg font-black text-gray-800">{user.name}</span>
            </div>
          )}
          
          <nav className="flex flex-col gap-2">
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition"
            >
              <Info className="w-5 h-5" />
              <span>About</span>
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition"
            >
              <Mail className="w-5 h-5" />
              <span>Contact</span>
            </Link>

            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              </>
            ) : (
              <>
                <div className="mt-4 border-t border-pink-50 pt-6 flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-600 border-2 border-gray-200 hover:border-pink-300 hover:text-pink-600 rounded-xl transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl transition shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </nav>

          {user && (
            <div className="mt-auto border-t border-pink-50 pt-6">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
