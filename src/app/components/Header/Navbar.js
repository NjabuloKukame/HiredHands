'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, User, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar({ onAuthClick }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };
  //First

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">HiredHands</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="text-white/80 hover:text-white font-medium smooth-transition">
              Browse Services
            </Link>
            <Link href="#" className="text-white/80 hover:text-white font-medium smooth-transition">
              How it Works
            </Link>
            {user?.role === 'provider' && (
              <Link href="/dashboard" className="text-white/80 hover:text-white font-medium smooth-transition">
                My Business
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/dashboard"
                  className="flex items-center space-x-2 text-white/80 hover:text-white smooth-transition"
                >
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                  />
                  <span className="font-medium text-white">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/60 hover:text-white smooth-transition"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onAuthClick}
                  className="text-white/80 hover:text-white font-medium smooth-transition"
                >
                  Sign In
                </button>
                <button
                  onClick={onAuthClick}
                  className="glass-button text-white px-6 py-2 rounded-xl font-medium"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}