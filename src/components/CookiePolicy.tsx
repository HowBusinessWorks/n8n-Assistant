import React, { useState } from 'react';
import { ArrowLeft, Cookie, Settings, Eye, BarChart, Target, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CookiePolicy() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('what');

  const sections = [
    { id: 'what', title: 'What Are Cookies?', icon: Cookie },
    { id: 'how', title: 'How We Use Cookies', icon: Settings },
    { id: 'types', title: 'Types of Cookies', icon: BarChart },
    { id: 'manage', title: 'Managing Cookies', icon: Eye },
    { id: 'third-party', title: 'Third-Party Cookies', icon: Target },
    { id: 'security', title: 'Data Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="bg-[#1f1f1f] border-b border-[#3a3a3a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-[#EFD09E] transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center space-x-3">
            <Cookie className="h-8 w-8 text-[#EFD09E]" />
            <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>
          </div>
          <p className="text-gray-400 mt-2">Last updated: January 7, 2025</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#3a3a3a] sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Navigation</h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        activeSection === section.id
                          ? 'bg-[#EFD09E]/20 text-[#EFD09E] border border-[#EFD09E]/30'
                          : 'text-gray-300 hover:text-white hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* What Are Cookies */}
            {activeSection === 'what' && (
              <section>
                <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
                  <Cookie className="h-6 w-6 mr-2" />
                  What Are Cookies?
                </h2>
                <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit our website. 
                    They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
                  </p>
                  <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-[#EFD09E]">
                    <p className="text-gray-300 text-sm">
                      <strong>Simple explanation:</strong> Think of cookies as a small note your browser keeps about your visit to our website. 
                      This note helps us remember things like whether you're logged in or what language you prefer.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* How We Use Cookies */}
            {activeSection === 'how' && (
              <section>
                <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
                  <Settings className="h-6 w-6 mr-2" />
                  How We Use Cookies
                </h2>
                <div className="space-y-6">
                  <div className="bg-green-900/20 rounded-lg p-6 border border-green-700/30">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">Essential Cookies (Always Active)</h3>
                    <p className="text-gray-300 text-sm mb-3">These cookies are necessary for our website to function properly and cannot be disabled:</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Authentication Cookies:</strong> Keep you logged in to your account</li>
                      <li>• <strong>Security Cookies:</strong> Protect against fraud and maintain security</li>
                      <li>• <strong>Session Cookies:</strong> Remember your actions during a single browsing session</li>
                      <li>• <strong>Load Balancing:</strong> Ensure optimal performance across our servers</li>
                    </ul>
                  </div>

                  <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-700/30">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">Functional Cookies</h3>
                    <p className="text-gray-300 text-sm mb-3">These cookies enhance functionality and personalization (you can opt-out):</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Preferences:</strong> Remember your settings and preferences</li>
                      <li>• <strong>Language Settings:</strong> Store your preferred language</li>
                      <li>• <strong>Theme Preferences:</strong> Remember your display preferences</li>
                      <li>• <strong>Form Data:</strong> Temporarily store form information to prevent data loss</li>
                    </ul>
                  </div>

                  <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-700/30">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Analytics Cookies</h3>
                    <p className="text-gray-300 text-sm mb-3">These cookies help us understand how visitors use our website (you can opt-out):</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Usage Analytics:</strong> Track how you interact with our service</li>
                      <li>• <strong>Performance Monitoring:</strong> Identify areas for improvement</li>
                      <li>• <strong>Error Tracking:</strong> Help us fix bugs and technical issues</li>
                      <li>• <strong>Feature Usage:</strong> Understand which features are most valuable</li>
                    </ul>
                  </div>

                  <div className="bg-orange-900/20 rounded-lg p-6 border border-orange-700/30">
                    <h3 className="text-lg font-semibold text-orange-400 mb-3">Marketing Cookies</h3>
                    <p className="text-gray-300 text-sm mb-3">These cookies are used for advertising and marketing purposes (you can opt-out):</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Conversion Tracking:</strong> Measure the effectiveness of our marketing campaigns</li>
                      <li>• <strong>Retargeting:</strong> Show you relevant ads on other websites</li>
                      <li>• <strong>Social Media Integration:</strong> Enable sharing on social platforms</li>
                      <li>• <strong>A/B Testing:</strong> Test different versions of our website</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Types of Cookies */}
            {activeSection === 'types' && (
              <section>
                <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
                  <BarChart className="h-6 w-6 mr-2" />
                  Types of Cookies We Use
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-white mb-3">Session Cookies</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Temporary cookies that expire when you close your browser</li>
                      <li>• Used for essential website functionality</li>
                      <li>• Not stored permanently on your device</li>
                    </ul>
                  </div>

                  <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-white mb-3">Persistent Cookies</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Remain on your device for a specified period</li>
                      <li>• Remember your preferences between visits</li>
                      <li>• Can be deleted manually through browser settings</li>
                    </ul>
                  </div>

                  <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-white mb-3">First-Party Cookies</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Set directly by n8n Assistant</li>
                      <li>• Used for core website functionality and user experience</li>
                      <li>• Essential for providing our service</li>
                    </ul>
                  </div>

                  <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-white mb-3">Third-Party Cookies</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Set by our trusted partners and service providers</li>
                      <li>• Subject to their respective privacy policies</li>
                      <li>• Used for analytics, authentication, and enhanced functionality</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Managing Cookies */}
            {activeSection === 'manage' && (
              <section>
                <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
                  <Eye className="h-6 w-6 mr-2" />
                  Managing Your Cookie Preferences
                </h2>
                <div className="space-y-6">
                  <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-white mb-4">Cookie Consent</h3>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li>• You can manage your cookie preferences through our cookie banner</li>
                      <li>• You can change your preferences at any time</li>
                      <li>• Essential cookies cannot be disabled as they are necessary for the service</li>
                    </ul>
                  </div>

                  <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-white mb-4">Browser Settings</h3>
                    <p className="text-gray-300 mb-4">You can control cookies through your browser settings:</p>
                    
                    <div className="space-y-4">
                      <div className="bg-[#2a2a2a] rounded p-4">
                        <h4 className="text-white font-medium mb-2">Chrome</h4>
                        <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                          <li>Settings → Privacy and Security → Cookies and other site data</li>
                          <li>Choose your preferred cookie settings</li>
                          <li>Manage exceptions for specific sites</li>
                        </ol>
                      </div>

                      <div className="bg-[#2a2a2a] rounded p-4">
                        <h4 className="text-white font-medium mb-2">Firefox</h4>
                        <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                          <li>Settings → Privacy & Security</li>
                          <li>Enhanced Tracking Protection settings</li>
                          <li>Manage Data and cookie settings</li>
                        </ol>
                      </div>

                      <div className="bg-[#2a2a2a] rounded p-4">
                        <h4 className="text-white font-medium mb-2">Safari</h4>
                        <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                          <li>Preferences → Privacy</li>
                          <li>Manage Cookies and Website Data</li>
                          <li>Block or allow cookies as preferred</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-700/30">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">Impact of Disabling Cookies</h3>
                    <p className="text-gray-300 text-sm mb-3">If you choose to disable cookies, some features may not work properly:</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• You may not be able to stay logged in</li>
                      <li>• Security features may not function correctly</li>
                      <li>• Preferences will not be remembered</li>
                      <li>• Some pages may not load properly</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Third-Party Cookies */}
            {activeSection === 'third-party' && (
              <section>
                <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
                  <Target className="h-6 w-6 mr-2" />
                  Third-Party Cookies
                </h2>
                <p className="text-gray-300 mb-6">We work with trusted third-party service providers who may also set cookies:</p>
                
                <div className="space-y-4">
                  <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-white">Authentication (Clerk)</h3>
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Essential</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2"><strong>Purpose:</strong> Secure user authentication and account management</p>
                    <p className="text-gray-300 text-sm mb-2"><strong>Data:</strong> Login status, user preferences, security tokens</p>
                    <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#EFD09E] text-sm hover:underline">
                      View Clerk Privacy Policy
                    </a>
                  </div>

                  <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-white">Payment Processing (Stripe)</h3>
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Essential</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2"><strong>Purpose:</strong> Secure payment processing and fraud prevention</p>
                    <p className="text-gray-300 text-sm mb-2"><strong>Data:</strong> Payment-related information, transaction security</p>
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#EFD09E] text-sm hover:underline">
                      View Stripe Privacy Policy
                    </a>
                  </div>

                  <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-white">AI Services (Anthropic/OpenRouter)</h3>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Functional</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2"><strong>Purpose:</strong> AI-powered workflow generation</p>
                    <p className="text-gray-300 text-sm mb-2"><strong>Data:</strong> Workflow generation requests and responses</p>
                    <div className="flex space-x-4">
                      <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#EFD09E] text-sm hover:underline">
                        Anthropic Privacy
                      </a>
                      <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-[#EFD09E] text-sm hover:underline">
                        OpenRouter Privacy
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Data Security */}
            {activeSection === 'security' && (
              <section>
                <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
                  <Shield className="h-6 w-6 mr-2" />
                  Data Security
                </h2>
                <div className="space-y-6">
                  <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-white mb-4">How We Protect Cookie Data</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="text-gray-300 text-sm space-y-2">
                        <li>• <strong>Encryption:</strong> Sensitive cookie data is encrypted</li>
                        <li>• <strong>Secure Transmission:</strong> Cookies are transmitted over secure connections</li>
                      </ul>
                      <ul className="text-gray-300 text-sm space-y-2">
                        <li>• <strong>Access Controls:</strong> Limited access to cookie data within our organization</li>
                        <li>• <strong>Regular Audits:</strong> Regular security assessments and updates</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#1f1f1f] to-[#272727] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Rights</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-medium mb-2">Right to Information</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Know what cookies we use and why</li>
                          <li>• Understand how your data is processed</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">Right to Control</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Accept or reject non-essential cookies</li>
                          <li>• Change your preferences at any time</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}