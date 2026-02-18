'use client';

import { useState, useEffect } from 'react';
import { X, User, Briefcase, AlertCircle, Apple } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin');
  const [role, setRole] = useState('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { login, signup } = useAuth();

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result = mode === 'signin' 
        ? await login(formData.email, formData.password)
        : await signup(formData.name, formData.email, formData.password, role);

      if (result.success) onClose();
      else setError(result.error || 'Authentication failed');
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-lg md:rounded-[2.5rem] rounded-t-[2.5rem] p-8 md:p-10 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-[#1a1a1a]">
              {mode === 'signin' ? 'Welcome Back' : 'Join HiredHands'}
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              {mode === 'signin' ? 'Enter your details to continue' : 'Create an account to get started'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* OAuth Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          <button className="flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-3 py-3.5 px-4 bg-[#1a1a1a] text-white rounded-2xl font-bold text-sm hover:bg-black transition-all">
            <Apple className="w-5 h-5 fill-white" />
            Apple
          </button>
        </div>

        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <span className="relative px-4 bg-white text-xs font-bold text-gray-400 uppercase tracking-widest">Or continue with email</span>
        </div>

        {/* Role Picker (Signup Only) */}
        {mode === 'signup' && (
          <div className="mb-6 flex p-1.5 bg-gray-50 rounded-[1.5rem] gap-1">
            <button 
              onClick={() => setRole('CUSTOMER')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.2rem] text-sm font-bold transition-all ${role === 'CUSTOMER' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
            >
              <User className="w-4 h-4" /> Client
            </button>
            <button 
              onClick={() => setRole('PROVIDER')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.2rem] text-sm font-bold transition-all ${role === 'PROVIDER' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
            >
              <Briefcase className="w-4 h-4" /> Provider
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              required
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          )}
          <input
            type="email"
            required
            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            required
            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-bold text-gray-400">
          {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-black underline underline-offset-4 decoration-2"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}