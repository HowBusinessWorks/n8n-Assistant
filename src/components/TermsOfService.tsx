import React from 'react';
import { ArrowLeft, FileText, User, CreditCard, Shield, AlertTriangle, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="bg-[#1f1f1f] border-b border-[#3a3a3a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-[#EFD09E] transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-[#EFD09E]" />
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          </div>
          <p className="text-gray-400 mt-2">Last updated: January 7, 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Agreement */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-4">Agreement to Terms</h2>
          <p className="text-gray-300 leading-relaxed">
            By accessing and using n8n Assistant ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
          </p>
        </section>

        {/* Service Description */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6">Description of Service</h2>
          <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
            <p className="text-gray-300 mb-4">n8n Assistant is an AI-powered platform that generates n8n automation workflows based on natural language descriptions. Our service includes:</p>
            <ul className="text-gray-300 space-y-2">
              <li>• AI-driven workflow generation from text descriptions</li>
              <li>• n8n-compatible workflow export functionality</li>
              <li>• User account management and authentication</li>
              <li>• Subscription-based access tiers</li>
              <li>• Customer support and documentation</li>
            </ul>
          </div>
        </section>

        {/* User Accounts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
            <User className="h-6 w-6 mr-2" />
            User Accounts
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
              <h3 className="text-lg font-semibold text-white mb-3">Account Creation</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• You must provide accurate and complete information when creating an account</li>
                <li>• You are responsible for maintaining the security of your account credentials</li>
                <li>• You must notify us immediately of any unauthorized use of your account</li>
                <li>• You must be at least 13 years old to use our service</li>
              </ul>
            </div>

            <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
              <h3 className="text-lg font-semibold text-white mb-3">Account Responsibility</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• You are responsible for all activities that occur under your account</li>
                <li>• You agree to use strong passwords and keep them confidential</li>
                <li>• You may not share your account with others</li>
                <li>• We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Acceptable Use */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6">Acceptable Use</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-lg p-6 border border-green-700/30">
              <h3 className="text-lg font-semibold text-green-400 mb-3">✓ Permitted Use</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Generate legitimate automation workflows for business or personal use</li>
                <li>• Create workflows that comply with applicable laws and regulations</li>
                <li>• Export and implement workflows in your own n8n installations</li>
                <li>• Share feedback and suggestions for service improvement</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-lg p-6 border border-red-700/30">
              <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                ✗ Prohibited Use
              </h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Generate workflows for illegal, harmful, or malicious purposes</li>
                <li>• Create workflows that violate third-party rights or terms of service</li>
                <li>• Attempt to reverse engineer, hack, or exploit our AI models</li>
                <li>• Generate excessive requests to overwhelm our systems</li>
                <li>• Share or distribute your account access credentials</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Content and IP */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6">Content and Intellectual Property</h2>
          
          <div className="space-y-6">
            <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
              <h3 className="text-lg font-semibold text-white mb-3">Your Content</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• You retain ownership of the text descriptions you provide to our service</li>
                <li>• You grant us a license to use your inputs to generate workflows and improve our service</li>
                <li>• You represent that your inputs do not violate any third-party rights</li>
                <li>• You are responsible for ensuring your workflow descriptions are legal and appropriate</li>
              </ul>
            </div>

            <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
              <h3 className="text-lg font-semibold text-white mb-3">Generated Workflows</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Generated workflows are provided "as-is" for your use</li>
                <li>• You may use, modify, and implement generated workflows for any lawful purpose</li>
                <li>• We do not claim ownership of the generated workflows</li>
                <li>• However, we retain rights to the underlying AI models and generation techniques</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
            <CreditCard className="h-6 w-6 mr-2" />
            Subscription and Payment Terms
          </h2>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#3a3a3a]">
                <h4 className="text-white font-semibold mb-2">Free Tier</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 3 free workflow generations</li>
                  <li>• No payment required</li>
                  <li>• Access may be limited</li>
                </ul>
              </div>

              <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#3a3a3a]">
                <h4 className="text-white font-semibold mb-2">Paid Subscriptions</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Monthly or annual billing</li>
                  <li>• Processed through Stripe</li>
                  <li>• Recurring charges authorized</li>
                </ul>
              </div>

              <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#3a3a3a]">
                <h4 className="text-white font-semibold mb-2">Billing & Refunds</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Auto-renewal unless cancelled</li>
                  <li>• Cancel anytime in settings</li>
                  <li>• No partial refunds</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Service Availability */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6">Service Availability</h2>
          <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Uptime and Performance</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• We strive to maintain high service availability but do not guarantee 100% uptime</li>
                  <li>• Scheduled maintenance will be announced in advance when possible</li>
                  <li>• We are not liable for service interruptions beyond our reasonable control</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Disclaimers and Limitations
          </h2>
          
          <div className="space-y-6">
            <div className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-700/30">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Service "As-Is"</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Our service is provided "as-is" without warranties of any kind</li>
                <li>• We do not guarantee that generated workflows will be error-free or meet your specific needs</li>
                <li>• You are responsible for testing and validating workflows before implementation</li>
                <li>• We do not warrant that our service will be uninterrupted or secure</li>
              </ul>
            </div>

            <div className="bg-red-900/20 rounded-lg p-6 border border-red-700/30">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Limitation of Liability</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Our liability is limited to the amount you paid for the service in the preceding 12 months</li>
                <li>• We are not liable for indirect, consequential, or punitive damages</li>
                <li>• We are not responsible for damages resulting from workflow implementation</li>
                <li>• Some jurisdictions do not allow liability limitations, so these may not apply to you</li>
              </ul>
            </div>
          </div>
        </section>
        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            By using n8n Assistant, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}