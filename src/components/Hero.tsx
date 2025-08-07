import React, { useState } from 'react';
import { ArrowRight, Sparkles, Zap, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import LoginPage from './LoginPage';
import hubspotIcon from '../assets/hubspot.png';
import supabaseIcon from '../assets/supabase.png';

// Custom SVG components for actual app logos with original colors
const GmailIcon = () => (
  <svg viewBox="0 0 24 24" className="h-10 w-10">
    <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

const SlackIcon = () => (
  <svg viewBox="0 0 24 24" className="h-10 w-10">
    <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z"/>
    <path fill="#E01E5A" d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
    <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z"/>
    <path fill="#36C5F0" d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
    <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z"/>
    <path fill="#2EB67D" d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/>
    <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z"/>
    <path fill="#ECB22E" d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

const GoogleSheetsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-10 w-10">
    <path fill="#34A853" d="M22.56 0H7.94c-.78 0-1.41.63-1.41 1.41v21.18c0 .78.63 1.41 1.41 1.41h14.62c.78 0 1.41-.63 1.41-1.41V1.41C23.97.63 23.34 0 22.56 0zm-1.05 19.5H8.99v-2.25h12.52v2.25zm0-4.5H8.99v-2.25h12.52v2.25zm0-4.5H8.99V8.25h12.52V10.5zm0-4.5H8.99V3.75h12.52V6z"/>
  </svg>
);

const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" className="h-10 w-10">
    <path fill="#10a37f" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
  </svg>
);

const SupabaseIcon = () => (
  <img src={supabaseIcon} alt="Supabase" className="h-10 w-10" />
);

const NotionIcon = () => (
  <svg viewBox="0 0 24 24" className="h-10 w-10">
    <path fill="#FFFFFF" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.533 2.24c-.466.046-.56.28-.374.466l1.3.996zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.094.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.222-.187z"/>
  </svg>
);

const HubSpotIcon = () => (
  <img src={hubspotIcon} alt="HubSpot" className="h-10 w-10" />
);

const FloatingAppSquares = () => {
  // Strategically positioned apps in empty spaces around the content
  const apps = [
    // Left side apps - alternating closer/further from edge
    { icon: GmailIcon, name: 'Gmail', top: '8%', left: '3%', delay: '0s', rotation: '3deg' },
    { icon: GoogleSheetsIcon, name: 'Google Sheets', top: '21%', left: '8%', delay: '2s', rotation: '-5deg' },
    { icon: OpenAIIcon, name: 'OpenAI', top: '34%', left: '2%', delay: '4s', rotation: '7deg' },
    { icon: SlackIcon, name: 'Slack', top: '47%', left: '9%', delay: '1s', rotation: '-3deg' },
    { icon: SupabaseIcon, name: 'Supabase', top: '60%', left: '4%', delay: '5s', rotation: '4deg' },
    { icon: NotionIcon, name: 'Notion', top: '73%', left: '7%', delay: '3s', rotation: '-6deg' },
    { icon: HubSpotIcon, name: 'HubSpot', top: '86%', left: '3%', delay: '1.5s', rotation: '2deg' },
    
    // Right side apps - alternating closer/further from edge
    { icon: HubSpotIcon, name: 'HubSpot', top: '8%', right: '3%', delay: '1s', rotation: '-3deg' },
    { icon: NotionIcon, name: 'Notion', top: '21%', right: '8%', delay: '3s', rotation: '5deg' },
    { icon: SupabaseIcon, name: 'Supabase', top: '34%', right: '2%', delay: '0s', rotation: '-7deg' },
    { icon: SlackIcon, name: 'Slack', top: '47%', right: '9%', delay: '4s', rotation: '3deg' },
    { icon: OpenAIIcon, name: 'OpenAI', top: '60%', right: '4%', delay: '2s', rotation: '-4deg' },
    { icon: GoogleSheetsIcon, name: 'Google Sheets', top: '73%', right: '7%', delay: '6s', rotation: '6deg' },
    { icon: GmailIcon, name: 'Gmail', top: '86%', right: '3%', delay: '2.5s', rotation: '-2deg' },
  ];

  const AppSquare = ({ icon: Icon, name, delay, rotation, ...position }) => (
    <div 
      className={`absolute bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:bg-white/20 transition-all duration-300 animate-float border border-white/20 hover:scale-110 cursor-pointer group`}
      style={{
        animationDelay: delay,
        animationDuration: '8s',
        transform: `rotate(${rotation})`,
        ...position,
      }}
    >
      <Icon />
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {name}
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {apps.map((app, index) => (
        <AppSquare key={index} {...app} />
      ))}
    </div>
  );
};

interface HeroProps {
  onFreeGenerationsClick?: (message?: string) => void;
}

export default function Hero({ onFreeGenerationsClick }: HeroProps = {}) {
  const [prompt, setPrompt] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  const promptExamples = [
    "Create weekly report from Gmail",
    "Backup files to Google Drive daily",
    "Send Slack notification for new orders"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      if (isSignedIn) {
        // User is signed in, proceed with navigation
        navigate('/chat', { state: { initialMessage: prompt } });
      } else {
        // User not signed in, store prompt and show login modal
        localStorage.setItem('pendingExample', prompt);
        setShowLogin(true);
      }
    }
  };

  const handleExampleClick = (example: string) => {
    if (isSignedIn) {
      // User is signed in, proceed with navigation
      navigate('/chat', { state: { initialMessage: example } });
    } else {
      // User not signed in, store example and show login modal
      localStorage.setItem('pendingExample', example);
      setShowLogin(true);
    }
  };

  // Handle closing the login modal
  const handleCloseLogin = () => {
    setShowLogin(false);
    // Clear any pending example if user closes modal without signing in
    localStorage.removeItem('pendingExample');
  };

  return (
    <section className="bg-gradient-to-br from-[#272727] via-[#2a2a2a] to-[#1f1f1f] min-h-[calc(100vh-4rem)] flex items-center relative overflow-hidden">
      {/* Subtle dotted grid background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, #EFD09E 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      />
      
      {/* Floating app squares - strategically positioned */}
      <FloatingAppSquares />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-[#1f1f1f]/50 rounded-full mb-6 border border-[#3a3a3a]">
            <Sparkles className="h-4 w-4 text-[#EFD09E] mr-2" />
            <span className="text-sm text-gray-300">AI-Powered Workflow Generation</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="text-white">Create your </span>
            <span className="text-[#EFD09E]">n8n Workflows</span>
            <span className="text-white block mt-2">
              from Plain Text
            </span>
          </h1>
          

          <div className="max-w-3xl mx-auto mb-6">
            <form onSubmit={handleSubmit} className="relative">
              <div className="bg-[#1f1f1f]/50 rounded-2xl p-2 shadow-2xl backdrop-blur-sm">
                <div className="bg-[#1f1f1f]/50 rounded-2xl p-2 shadow-2xl border border-[#3a3a3a] backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="flex-1 relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                        placeholder="Describe your workflow step by step..."
                        className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 resize-none focus:outline-none text-base"
                        rows={1}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!prompt.trim()}
                      className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] p-3 rounded-xl hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 m-2 font-semibold"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between px-4 py-2 border-t border-[#3a3a3a] mt-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Zap className="h-4 w-4" />
                        <span>Instant Generation</span>
                      </div>
                    </div>
                    <div className="text-sm text-[#EFD09E] font-medium">
                      3 Free generations
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Prompt Examples */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {promptExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="bg-[#1f1f1f]/30 border border-[#3a3a3a] text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-[#1f1f1f]/50 hover:border-[#EFD09E]/30 hover:text-[#EFD09E] transition-all duration-200 backdrop-blur-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginPage 
          onClose={handleCloseLogin}
          mode="signin"
        />
      )}
    </section>
  );
}