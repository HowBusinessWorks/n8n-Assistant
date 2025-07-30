import React, { useEffect } from 'react';
import { ExternalLink, Copy } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import LoginPage from './LoginPage';

interface ExamplesProps {
  onFreeGenerationsClick?: (message?: string) => void;
}

const examples = [
  {
    title: 'Customer Onboarding',
    description: 'Send welcome email when new customer signs up and add them to CRM',
    prompt: 'When a new customer signs up through our website form, send them a welcome email and add their information to our Salesforce CRM.',
    tags: ['Webhook', 'Email', 'Salesforce', 'Customer Management']
  },
  {
    title: 'Social Media Monitoring',
    description: 'Monitor Twitter mentions and send Slack notifications to marketing team',
    prompt: 'Monitor Twitter for mentions of our brand and send a notification to our #marketing Slack channel with the tweet details.',
    tags: ['Twitter', 'Slack', 'Social Media', 'Monitoring']
  },
  {
    title: 'E-commerce Order Processing',
    description: 'Process new Shopify orders and update inventory management system',
    prompt: 'When a new order comes in through Shopify, send order details to our fulfillment team via email and update our inventory in Airtable.',
    tags: ['Shopify', 'Email', 'Airtable', 'E-commerce']
  }
];

export default function Examples({ onFreeGenerationsClick }: ExamplesProps) {
  const { isSignedIn } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);
  const [selectedExample, setSelectedExample] = React.useState<string>('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExampleClick = (example: any) => {
    if (isSignedIn && onFreeGenerationsClick) {
      // User is signed in, proceed with navigation
      onFreeGenerationsClick(example.prompt);
    } else {
      // User not signed in, store example and show login modal
      localStorage.setItem('pendingExample', example.prompt);
      setSelectedExample(example.prompt);
      setShowLogin(true);
    }
  };

  // Handle closing the login modal
  const handleCloseLogin = () => {
    setShowLogin(false);
    setSelectedExample('');
    // Clear any pending example if user closes modal without signing in
    localStorage.removeItem('pendingExample');
  };

  return (
    <section id="examples" className="bg-[#1a1a1a] py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Popular workflow examples
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get inspired by these common automation scenarios. Click any example to try it yourself.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <div key={index} className="bg-[#1f1f1f] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#3a3a3a]">
              <h3 className="text-xl font-semibold text-white mb-3">{example.title}</h3>
              <p className="text-gray-300 mb-4">{example.description}</p>
              
              <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-gray-300 italic flex-1">"{example.prompt}"</p>
                  <button
                    onClick={() => copyToClipboard(example.prompt)}
                    className="ml-2 p-1 text-gray-400 hover:text-[#D4AA7D] transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {example.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="bg-[#EFD09E]/20 text-[#EFD09E] px-3 py-1 rounded-full text-sm border border-[#EFD09E]/30">
                    {tag}
                  </span>
                ))}
              </div>

              <button 
                onClick={() => handleExampleClick(example)}
                className="w-full bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] py-2 px-4 rounded-lg hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
              >
                <span>Try This Example</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          ))}
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