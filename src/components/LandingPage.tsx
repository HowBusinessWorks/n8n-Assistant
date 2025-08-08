import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Header from './Header';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Benefits from './Benefits';
import CTA from './CTA';
import Footer from './Footer';
import LoginPage from './LoginPage';

function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<'signin' | 'signup'>('signin');

  // Redirect logged-in users to chat page
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/chat', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Show loading while checking auth status
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EFD09E]"></div>
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page if user is signed in (redirect is happening)
  if (isSignedIn) {
    return null;
  }

  const handleFreeGenerationsClick = (message?: string) => {
    if (!isSignedIn) {
      // If not signed in, show login modal
      setLoginMode('signin');
      setShowLogin(true);
    } else {
      // If signed in, navigate to chat
      if (message) {
        navigate('/chat', { state: { initialMessage: message } });
      } else {
        navigate('/chat');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header onFreeGenerationsClick={handleFreeGenerationsClick} />
      <Hero onFreeGenerationsClick={handleFreeGenerationsClick} />
      <HowItWorks onFreeGenerationsClick={handleFreeGenerationsClick} />
      <Benefits />
      <CTA onFreeGenerationsClick={handleFreeGenerationsClick} />
      <Footer />
      
      {/* Authentication Modal */}
      {showLogin && (
        <LoginPage 
          onClose={() => setShowLogin(false)}
          mode={loginMode}
        />
      )}
    </div>
  );
}

export default LandingPage;