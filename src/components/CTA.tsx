import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CTAProps {
  onFreeGenerationsClick?: () => void;
}

export default function CTA({ onFreeGenerationsClick }: CTAProps) {
  return (
    <section className="bg-gradient-to-r from-[#272727] via-[#2a2a2a] to-[#1f1f1f] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Stop building workflows manually
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Join thousands of businesses who've replaced 2-8 hours of manual work with 30 seconds of AI automation. Start creating enterprise-grade workflows today.
        </p>

        <div className="flex justify-center">
          <button 
            onClick={onFreeGenerationsClick}
            className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] px-8 py-4 rounded-xl font-semibold hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
          >
            <span>Create Your First Workflow</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-400 text-sm mt-6">
          No credit card required • 80-98% accuracy • Enterprise-grade quality
        </p>
      </div>
    </section>
  );
}