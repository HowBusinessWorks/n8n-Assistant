import React from 'react';
import { ArrowLeft, Mail, Shield, Eye, Database, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
            <Shield className="h-8 w-8 text-[#EFD09E]" />
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-gray-400 mt-2">Last updated: January 7, 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-4 flex items-center">
            <Eye className="h-6 w-6 mr-2" />
            Introduction
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Welcome to WorkflowAI ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and use our services, and tell you about your privacy rights.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
            <Database className="h-6 w-6 mr-2" />
            Information We Collect
          </h2>
          
          <div className="space-y-6">
            <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
              <h3 className="text-xl font-semibold text-white mb-3">Personal Information You Provide</h3>
              <ul className="text-gray-300 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, and authentication credentials when you create an account</li>
                <li><strong>Payment Information:</strong> Billing details and payment method information (processed securely through Stripe)</li>
                <li><strong>Communication Data:</strong> Messages, feedback, and support inquiries you send to us</li>
                <li><strong>Workflow Data:</strong> The text descriptions and generated workflows you create using our service</li>
              </ul>
            </div>

            <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
              <h3 className="text-xl font-semibold text-white mb-3">Information We Collect Automatically</h3>
              <ul className="text-gray-300 space-y-2">
                <li><strong>Usage Data:</strong> How you interact with our service, features used, and time spent</li>
                <li><strong>Device Information:</strong> Browser type, device type, IP address, and operating system</li>
                <li><strong>Analytics Data:</strong> Aggregated usage statistics and performance metrics</li>
                <li><strong>Cookies and Tracking:</strong> As described in our Cookie Policy</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6">How We Use Your Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
              <h3 className="text-lg font-semibold text-white mb-3">Service Provision</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Create and manage your user account</li>
                <li>• Generate n8n workflows based on your text descriptions</li>
                <li>• Process payments and manage subscriptions</li>
                <li>• Provide customer support and respond to inquiries</li>
              </ul>
            </div>

            <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
              <h3 className="text-lg font-semibold text-white mb-3">Service Improvement</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Analyze usage patterns to improve our AI algorithms</li>
                <li>• Develop new features and enhance existing functionality</li>
                <li>• Monitor service performance and troubleshoot issues</li>
                <li>• Conduct research and analytics for service optimization</li>
              </ul>
            </div>

            <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
              <h3 className="text-lg font-semibold text-white mb-3">Communication</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Send important service updates and security notifications</li>
                <li>• Respond to your questions and provide customer support</li>
                <li>• Send marketing communications (with your consent)</li>
              </ul>
            </div>

            <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
              <h3 className="text-lg font-semibold text-white mb-3">Legal and Security</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Comply with legal obligations and enforce our terms</li>
                <li>• Protect against fraud, abuse, and security threats</li>
                <li>• Resolve disputes and enforce agreements</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
            <Globe className="h-6 w-6 mr-2" />
            Data Sharing and Disclosure
          </h2>
          
          <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a] mb-6">
            <p className="text-gray-300 mb-4 font-medium">We do not sell your personal data. We may share your information in these limited circumstances:</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Service Providers</h4>
                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                  <li>• <strong>Clerk:</strong> Authentication and user management</li>
                  <li>• <strong>Supabase:</strong> Database hosting and backend services</li>
                  <li>• <strong>Stripe:</strong> Payment processing and subscription management</li>
                  <li>• <strong>Anthropic/OpenRouter:</strong> AI model providers for workflow generation</li>
                  <li>• <strong>Analytics Providers:</strong> Service usage analytics (anonymized data)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6">Data Security</h2>
          <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
            <p className="text-gray-300 mb-4">We implement appropriate technical and organizational measures to protect your personal data:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
                <li>• <strong>Access Controls:</strong> Strict access controls and authentication</li>
                <li>• <strong>Regular Security Audits:</strong> Ongoing monitoring and security assessments</li>
              </ul>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <strong>Secure Infrastructure:</strong> Cloud providers with industry-standard security</li>
                <li>• <strong>Data Minimization:</strong> We collect only necessary data</li>
                <li>• <strong>Regular Updates:</strong> Security systems are regularly updated</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6">Your Rights</h2>
          <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#3a3a3a]">
            <p className="text-gray-300 mb-4">Depending on your location, you may have the following rights:</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Access and Portability</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Request access to your personal data</li>
                  <li>• Receive a copy of your data in a portable format</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Correction and Deletion</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Correct inaccurate or incomplete personal data</li>
                  <li>• Request deletion of your personal data</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gradient-to-r from-[#1f1f1f] to-[#272727] rounded-lg p-8 border border-[#3a3a3a]">
          <h2 className="text-2xl font-bold text-[#EFD09E] mb-6 flex items-center">
            <Mail className="h-6 w-6 mr-2" />
            Contact Us
          </h2>
          <p className="text-gray-300 mb-4">If you have any questions about this privacy policy or our data practices, please contact us:</p>
          <div className="space-y-2 text-gray-300">
            <p><strong>Email:</strong> privacy@workflowai.com</p>
            <p><strong>Address:</strong> [Your Business Address]</p>
            <p><strong>Data Protection Officer:</strong> privacy@workflowai.com</p>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            For EU residents, our representative can be contacted at: eu-privacy@workflowai.com
          </p>
        </section>
      </div>
    </div>
  );
}