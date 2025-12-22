'use client';

import { useState } from 'react';
import Navbar from '../Header/Navbar';
import AuthModal from '../AuthFormat/AuthModal';

export default function ClientLayout({ children }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <Navbar onAuthClick={() => setShowAuthModal(true)} />
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}