import React from 'react';
import { Workflow, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#272727] border-t border-[#3a3a3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] p-2 rounded-lg">
                <Workflow className="h-6 w-6 text-[#272727]" />
              </div>
              <span className="text-xl font-bold text-white">WorkflowAI</span>
            </div>
            <p className="text-gray-400 max-w-md mb-6">
              Transform your ideas into powerful n8n workflows using the latest AI technology. 
              Automate smarter, not harder.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">Examples</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#EFD09E] transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#3a3a3a] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 WorkflowAI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-[#EFD09E] text-sm transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-[#EFD09E] text-sm transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-[#EFD09E] text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}