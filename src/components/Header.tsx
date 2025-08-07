import React from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { Workflow } from 'lucide-react';
import LoginPage from './LoginPage';

interface HeaderProps {
  onFreeGenerationsClick?: () => void;
}

export default function Header({ onFreeGenerationsClick }: HeaderProps = {}) {
  const [showLogin, setShowLogin] = React.useState(false);
  const [loginMode, setLoginMode] = React.useState<'signin' | 'signup'>('signin');
  const { isSignedIn, isLoaded } = useAuth();

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setLoginMode(mode);
    setShowLogin(true);
  };

  const handleExamplesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFreeGenerationsClick = () => {
    if (!isSignedIn) {
      // If not signed in, show login modal
      setLoginMode('signin');
      setShowLogin(true);
    } else {
      // If signed in, proceed with navigation
      onFreeGenerationsClick?.();
    }
  };

  return (
    <header className="bg-[#272727] border-[#3a3a3a] border-b relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] p-2 rounded-lg">
              <Workflow className="h-6 w-6 text-[#272727]" />
            </div>
            <span className="text-xl font-bold text-white">n8n Assistant</span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={handleHowItWorksClick}
              className="text-gray-300 hover:text-[#EFD09E] transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={handleExamplesClick}
              className="text-gray-300 hover:text-[#EFD09E] transition-colors"
            >
              Examples
            </button>
            
            {isLoaded && isSignedIn ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleFreeGenerationsClick}
                  className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] px-6 py-2 rounded-lg hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 transform hover:scale-105 font-semibold"
                >
                  Create Workflow
                </button>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                      userButtonPopoverCard: "bg-[#1f1f1f] border border-[#3a3a3a]",
                      userButtonPopoverText: "text-white",
                      userButtonPopoverActionButton: "text-gray-300 hover:text-[#EFD09E]"
                    }
                  }}
                />
              </div>
            ) : (
              <button 
                onClick={handleFreeGenerationsClick}
                className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] px-6 py-2 rounded-lg hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 transform hover:scale-105 font-semibold"
              >
                Free Generations
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-300 hover:text-[#EFD09E]">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {showLogin && (
        <LoginPage 
          onClose={() => setShowLogin(false)}
          mode={loginMode}
        />
      )}
    </header>
  );
}