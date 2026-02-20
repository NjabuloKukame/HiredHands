'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Zap, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar({ onAuthClick }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  if (pathname !== prevPathname) {
    setIsMenuOpen(false);
    setPrevPathname(pathname);
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'py-3 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex justify-between items-center h-12">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group relative z-50">
            <div className="bg-[#1a1a1a] p-1.5 rounded-xl transition-transform group-hover:rotate-12">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-[#1a1a1a] uppercase">
              {/* Responsive name: HH on mobile, Full on desktop */}
              <span className="inline md:hidden">HH</span>
              <span className="hidden md:inline">HiredHands</span>
            </span>
          </Link>
          
          {/* Desktop Nav - Pill Style */}
          <div className="hidden md:flex items-center bg-gray-50/50 border border-gray-100 rounded-full px-1 py-1">
            <Link href="/search" className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              pathname === '/search' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}>
              Browse
            </Link>
            <Link href="#" className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-black">
              Resources
            </Link>
          </div>
          
          {/* Desktop & Mobile Actions */}
          <div className="flex items-center space-x-2 relative z-50">
            {!user ? (
              <>
                <button onClick={onAuthClick} className="hidden md:block px-6 py-2.5 text-sm font-bold text-[#1a1a1a]">
                  Sign In
                </button>
                <button onClick={onAuthClick} className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-black/10">
                  Join
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/customer-dashboard" className="flex items-center space-x-3">
                  <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                </Link>
                <button onClick={logout} className="p-2.5 bg-gray-50 rounded-full hover:bg-red-50 transition-colors group">
                  <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 bg-gray-50 rounded-full md:hidden text-[#1a1a1a]"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-40 transition-transform duration-500 md:hidden ${
        isMenuOpen ? 'translate-y-0' : '-translate-y-full invisible'
      }`}>
        <div className="pt-32 px-8 flex flex-col space-y-8">
          <Link href="/search" className="text-4xl font-black tracking-tighter flex justify-between items-center">
            Browse <ChevronRight className="w-8 h-8 text-gray-200" />
          </Link>
          <Link href="#" className="text-4xl font-black tracking-tighter flex justify-between items-center">
            How it Works <ChevronRight className="w-8 h-8 text-gray-200" />
          </Link>
          <Link href="#" className="text-4xl font-black tracking-tighter flex justify-between items-center">
            Stories <ChevronRight className="w-8 h-8 text-gray-200" />
          </Link>
          
          <div className="pt-10 space-y-4">
            {user ? (
              <button onClick={logout} className="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-bold text-lg">
                Logout
              </button>
            ) : (
              <button onClick={onAuthClick} className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-lg">
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}