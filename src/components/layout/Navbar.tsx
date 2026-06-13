import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import { MessageCircleHeart, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (['/', '/login', '/signup', '/about', '/privacy', '/terms', '/contact', '/faq'].includes(location.pathname)) {
    return null; // Landing/auth/static pages have custom headers
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/60 backdrop-blur-md border-b border-pink-100 z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-pink-500 rounded-full p-1.5 flex items-center justify-center">
                <MessageCircleHeart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-400">
                BubuWish
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm font-bold text-gray-600 hidden sm:block">Hello, {user.name}</span>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-pink-100 text-pink-700 uppercase tracking-widest hidden sm:block">{user.role}</span>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:block">Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
