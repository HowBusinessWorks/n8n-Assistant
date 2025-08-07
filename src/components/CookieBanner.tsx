import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Shield } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, can't be disabled
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a cookie choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    
    saveCookiePreferences(allAccepted);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    
    saveCookiePreferences(onlyEssential);
    setIsVisible(false);
  };

  const handleSaveSettings = () => {
    saveCookiePreferences(preferences);
    setIsVisible(false);
    setShowSettings(false);
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Here you would typically initialize analytics/marketing scripts based on preferences
    if (prefs.analytics) {
      // Initialize Google Analytics or other analytics
      console.log('Analytics cookies enabled');
    }
    if (prefs.marketing) {
      // Initialize marketing/advertising scripts
      console.log('Marketing cookies enabled');
    }
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'essential') return; // Essential cookies can't be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <div className="bg-[#1f1f1f] rounded-2xl shadow-2xl border border-[#3a3a3a] max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {!showSettings ? (
          /* Main Banner */
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] p-2 rounded-xl">
                  <Cookie className="h-6 w-6 text-[#272727]" />
                </div>
                <h2 className="text-xl font-bold text-white">We value your privacy</h2>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#2a2a2a] transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                By clicking "Accept All", you consent to our use of cookies.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="h-4 w-4" />
                <span>Your data is protected and never sold to third parties</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 flex-1"
              >
                Accept All Cookies
              </button>
              
              <button
                onClick={handleRejectAll}
                className="bg-[#2a2a2a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#3a3a3a] transition-all duration-200 border border-[#3a3a3a] flex-1"
              >
                Reject All
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="bg-transparent text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E]/10 transition-all duration-200 border border-[#EFD09E] flex items-center justify-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Customize</span>
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <a href="/cookies" className="text-[#EFD09E] hover:underline">Cookie Policy</a>
              <a href="/privacy" className="text-[#EFD09E] hover:underline">Privacy Policy</a>
              <a href="/terms" className="text-[#EFD09E] hover:underline">Terms of Service</a>
            </div>
          </div>
        ) : (
          /* Settings Panel */
          <div className="p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Cookie Preferences</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#2a2a2a] transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-4 mb-6">
              {/* Essential Cookies */}
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#3a3a3a]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">Essential Cookies</h3>
                  <div className="bg-green-600 text-white text-xs px-2 py-1 rounded font-medium">
                    Always Active
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  These cookies are necessary for the website to function and cannot be switched off. 
                  They include authentication, security, and basic functionality cookies.
                </p>
                <div className="text-xs text-gray-400">
                  Examples: Login sessions, security tokens, load balancing
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#3a3a3a]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">Functional Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => handlePreferenceChange('functional')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EFD09E]"></div>
                  </label>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                </p>
                <div className="text-xs text-gray-400">
                  Examples: Language preferences, theme settings, form data
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#3a3a3a]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">Analytics Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EFD09E]"></div>
                  </label>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <div className="text-xs text-gray-400">
                  Examples: Google Analytics, usage statistics, performance monitoring
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#3a3a3a]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">Marketing Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange('marketing')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EFD09E]"></div>
                  </label>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  These cookies are used to deliver advertisements more relevant to you and your interests.
                </p>
                <div className="text-xs text-gray-400">
                  Examples: Ad personalization, conversion tracking, retargeting
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 flex-1"
              >
                Save Preferences
              </button>
              
              <button
                onClick={handleAcceptAll}
                className="bg-[#2a2a2a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#3a3a3a] transition-all duration-200 border border-[#3a3a3a] flex-1"
              >
                Accept All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}