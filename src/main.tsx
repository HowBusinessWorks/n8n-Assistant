import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => window.location.href = to}
      appearance={{
        baseTheme: undefined,
        elements: {
          card: 'bg-[#1f1f1f] border-[#3a3a3a] text-white',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton: 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50',
          socialButtonsBlockButtonText: 'text-gray-900',
          socialButtonsBlockButtonArrow: 'text-gray-900',
          formButtonPrimary: 'bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] hover:from-[#D4AA7D] hover:to-[#c19660]',
          formFieldInput: 'bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-400',
          formFieldLabel: 'text-white',
          formFieldHintText: 'text-gray-400',
          formFieldErrorText: 'text-red-400',
          formFieldSuccessText: 'text-green-400',
          formFieldAction: 'text-[#EFD09E] hover:text-[#D4AA7D]',
          dividerLine: 'bg-[#3a3a3a]',
          dividerText: 'text-white',
          footerActionText: 'text-gray-400',
          footerActionLink: 'text-[#EFD09E] hover:text-[#D4AA7D]',
          formButtonReset: 'text-[#EFD09E] hover:text-[#D4AA7D]',
          alternativeMethodsBlockButton: 'bg-[#2a2a2a] text-white border-[#3a3a3a] hover:bg-[#3a3a3a]',
          alternativeMethodsBlockButtonText: 'text-white',
          otpCodeFieldInput: 'bg-[#2a2a2a] border-[#3a3a3a] text-white',
          formResendCodeLink: 'text-[#EFD09E] hover:text-[#D4AA7D]',
          identityPreview: 'bg-[#2a2a2a] border-[#3a3a3a]',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-[#EFD09E] hover:text-[#D4AA7D]'
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
