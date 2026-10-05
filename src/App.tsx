import React, { createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import LandingPage from './components/pages/LandingPage';
import Login from './components/pages/Login';
import Signup from './components/pages/Signup';
import VerifyEmail from './components/pages/VerifyEmail';
import Dashboard from './components/pages/Dashboard';
import AdminDashboard from './components/pages/AdminDashboard';
import ProfilePage from './components/pages/ProfilePage';
import SecurityPage from './components/pages/SecurityPage';
import Navbar from './components/layout/Navbar';
import CardView from './components/pages/CardView';
import AboutPage from './components/pages/AboutPage';
import PrivacyPage from './components/pages/PrivacyPage';
import TermsPage from './components/pages/TermsPage';
import ContactPage from './components/pages/ContactPage';
import FAQPage from './components/pages/FAQPage';
import { ToastProvider, useToast } from './components/ui/ToastProvider';
import AIAssistantWidget from './components/ui/AIAssistantWidget';
import HeartCursorTrail from './components/HeartCursorTrail';
import { useTokenRefresh } from './hooks/useTokenRefresh';

import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children, roleRequired }: { children: React.ReactNode, roleRequired?: 'client' | 'admin' }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-dvh bg-gray-50 font-sans text-gray-900 flex flex-col overflow-x-hidden">
            <Navbar />
            <main className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/card" element={<CardView />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute roleRequired="client">
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/security" 
                  element={
                    <ProtectedRoute>
                      <SecurityPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute roleRequired="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <AIAssistantWidget />
            <HeartCursorTrail />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
