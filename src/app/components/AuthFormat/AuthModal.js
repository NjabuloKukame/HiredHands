'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthModal({ onClose }) {
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(formData.email, formData.password, role);
        onClose();
        router.push('/dashboard');
      } else {
        await signup(formData.name, formData.email, formData.password, role);
        onClose();
        if (role === 'provider') {
          router.push('/provider-setup');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-dark-card rounded-2xl max-w-md w-full p-8 shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Get Started'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/15 rounded-lg smooth-transition text-white/70 hover:text-white border border-white/20 hover:border-white/30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === 'signup' && (
          <div className="mb-6">
            <p className="text-sm text-white/80 mb-3">I want to:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-4 rounded-xl border-2 text-left smooth-transition ${
                  role === 'customer'
                    ? 'border-blue-400/60 bg-blue-500/20'
                    : 'border-white/30 hover:border-white/40 bg-white/5'
                }`}
              >
                <User className="h-6 w-6 mb-2 text-white" />
                <div className="font-medium text-white">Book Services</div>
                <div className="text-sm text-white/70">Find and hire professionals</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`p-4 rounded-xl border-2 text-left smooth-transition ${
                  role === 'provider'
                    ? 'border-blue-400/60 bg-blue-500/20'
                    : 'border-white/30 hover:border-white/40 bg-white/5'
                }`}
              >
                <Briefcase className="h-6 w-6 mb-2 text-white" />
                <div className="font-medium text-white">Offer Services</div>
                <div className="text-sm text-white/70">Grow your business</div>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 smooth-transition disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-white/90 hover:text-white font-medium smooth-transition underline decoration-white/30 hover:decoration-white/60"
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>
      </div>
    </div>
  );
}