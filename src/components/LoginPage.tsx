import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { X, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
  onClose: () => void;
  mode?: 'signin' | 'signup';
}

export default function LoginPage({ onClose, mode = 'signin' }: LoginPageProps) {
  const navigate = useNavigate();

  // Handle successful authentication
  const handleSignInSuccess = () => {
    onClose(); // Close the modal
    navigate('/chat'); // Navigate to chat page
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-[#1f1f1f] rounded-3xl shadow-2xl border border-[#3a3a3a] max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] p-2 rounded-xl">
              <Workflow className="h-5 w-5 text-[#272727]" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#2a2a2a] transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clerk Authentication Component */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-400">
              {mode === 'signin' 
                ? 'Sign in to get your 3 free workflow generations' 
                : 'Create account to get 3 free workflow generations'
              }
            </p>
          </div>
          
          <div className="clerk-auth-wrapper">
            {mode === 'signin' ? (
              <SignIn 
                redirectUrl="/chat"
                afterSignInUrl="/chat"
                signUpUrl="#"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] hover:from-[#D4AA7D] hover:to-[#c19660]',
                    formFieldInput: 'bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-400',
                    formFieldInputShowPasswordIcon: 'text-white',
                    formHeaderTitle: 'text-white',
                    formHeaderSubtitle: 'text-white',
                    socialButtonsBlockButton: 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50',
                    socialButtonsBlockButtonText: 'text-gray-900',
                    socialButtonsBlockButtonArrow: 'text-gray-900',
                    dividerLine: 'bg-[#3a3a3a]',
                    dividerText: 'text-white',
                    formFieldLabel: 'text-white',
                    formFieldHintText: 'text-gray-400',
                    formFieldErrorText: 'text-red-400',
                    formFieldSuccessText: 'text-green-400',
                    formFieldAction: 'text-[#EFD09E] hover:text-[#D4AA7D]',
                    footerActionText: 'text-gray-400',
                    footerActionLink: 'text-[#EFD09E] hover:text-[#D4AA7D]',
                    formButtonReset: 'text-[#EFD09E] hover:text-[#D4AA7D]',
                    alternativeMethodsBlockButton: 'bg-[#2a2a2a] text-white border-[#3a3a3a] hover:bg-[#3a3a3a]',
                    alternativeMethodsBlockButtonText: 'text-white',
                    otpCodeFieldInput: 'bg-[#2a2a2a] border-[#3a3a3a] text-white',
                    formResendCodeLink: 'text-[#EFD09E] hover:text-[#D4AA7D]',
                    card: 'bg-transparent shadow-none',
                    rootBox: 'bg-transparent',
                    footer: 'hidden',
                    identityPreview: 'bg-[#2a2a2a] border-[#3a3a3a]',
                    identityPreviewText: 'text-white',
                    identityPreviewEditButton: 'text-[#EFD09E] hover:text-[#D4AA7D]'
                  }
                }}
              />
            ) : (
              <SignUp 
                redirectUrl="/chat"
                afterSignUpUrl="/chat"
                signInUrl="#"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] hover:from-[#D4AA7D] hover:to-[#c19660]',
                    formFieldInput: 'bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-400',
                    formFieldInputShowPasswordIcon: 'text-white',
                    formHeaderTitle: 'text-white',
                    formHeaderSubtitle: 'text-white',
                    socialButtonsBlockButton: 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50',
                    socialButtonsBlockButtonText: 'text-gray-900',
                    socialButtonsBlockButtonArrow: 'text-gray-900',
                    dividerLine: 'bg-[#3a3a3a]',
                    dividerText: 'text-white',
                    formFieldLabel: 'text-white',
                    formFieldHintText: 'text-gray-400',
                    formFieldErrorText: 'text-red-400',
                    formFieldSuccessText: 'text-green-400',
                    formFieldAction: 'text-[#EFD09E] hover:text-[#D4AA7D]',
                    footerActionText: 'text-gray-400',
                    footerActionLink: 'text-[#EFD09E] hover:text-[#D4AA7D]',
                    formButtonReset: 'text-[#EFD09E] hover:text-[#D4AA7D]',
                    alternativeMethodsBlockButton: 'bg-[#2a2a2a] text-white border-[#3a3a3a] hover:bg-[#3a3a3a]',
                    alternativeMethodsBlockButtonText: 'text-white',
                    otpCodeFieldInput: 'bg-[#2a2a2a] border-[#3a3a3a] text-white',
                    formResendCodeLink: 'text-[#EFD09E] hover:text-[#D4AA7D]',
                    card: 'bg-transparent shadow-none',
                    rootBox: 'bg-transparent',
                    footer: 'hidden',
                    identityPreview: 'bg-[#2a2a2a] border-[#3a3a3a]',
                    identityPreviewText: 'text-white',
                    identityPreviewEditButton: 'text-[#EFD09E] hover:text-[#D4AA7D]'
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}