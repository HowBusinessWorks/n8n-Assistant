import React from 'react';
import { MessageSquare, Cpu, Download, Play, ArrowDown } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            How our AI creates
            <span className="block text-[#D4AA7D]">perfect workflows</span>
          </h2>        
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our advanced 5-step AI system analyzes 2,600+ real automation examples to generate enterprise-grade workflows with 80-98% accuracy.
          </p>
        </div>

        {/* Process Flow */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#EFD09E] via-[#D4AA7D] to-[#EFD09E] transform -translate-x-1/2 hidden md:block"></div>
          
          {/* Steps */}
          <div className="space-y-16">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
                  <div className="bg-[#1f1f1f] rounded-3xl p-8 shadow-lg border border-[#3a3a3a] relative">
                    <div className="absolute -top-4 -left-4 bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                      <MessageSquare className="h-6 w-6 text-[#272727]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 mt-4">AI understands instantly</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      Our AI achieves 80-98% accuracy in understanding complex automation requests, no matter how you describe them.
                    </p>
                    <div className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]">
                      <p className="text-sm text-gray-300 italic">
                        "When someone uploads a document, analyze it with AI and save insights to Notion"
                      </p>
                      <div className="mt-3 text-xs text-[#D4AA7D]">
                        ✓ Webhook trigger → AI processing → Database storage
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-gradient-to-br from-[#272727] to-[#1f1f1f] rounded-2xl p-6 text-white">
                    <div className="text-[#EFD09E] text-sm font-medium mb-2">Step 1</div>
                    <div className="text-lg font-semibold">Smart Understanding</div>
                  </div>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="flex justify-center mt-8 md:hidden">
                <ArrowDown className="h-6 w-6 text-[#D4AA7D]" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col md:flex-row-reverse items-center">
                <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0">
                  <div className="bg-[#1f1f1f] rounded-3xl p-8 shadow-lg border border-[#3a3a3a] relative">
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#D4AA7D] to-[#c19660] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                      <Cpu className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 mt-4">Learns from 2,600+ examples</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      Our AI searches through thousands of real automation workflows to find the best patterns and creates your custom solution.
                    </p>
                    <div className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>Finding best templates...</span>
                        <span>2,600+ examples</span>
                      </div>
                      <div className="w-full bg-[#1f1f1f] rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#D4AA7D] to-[#EFD09E] h-2 rounded-full w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 md:pr-12">
                  <div className="bg-gradient-to-br from-[#272727] to-[#1f1f1f] rounded-2xl p-6 text-white">
                    <div className="text-[#EFD09E] text-sm font-medium mb-2">Step 2</div>
                    <div className="text-lg font-semibold">Smart Research</div>
                  </div>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="flex justify-center mt-8 md:hidden">
                <ArrowDown className="h-6 w-6 text-[#D4AA7D]" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
                  <div className="bg-[#1f1f1f] rounded-3xl p-8 shadow-lg border border-[#3a3a3a] relative">
                    <div className="absolute -top-4 -left-4 bg-gradient-to-r from-[#c19660] to-[#D4AA7D] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 mt-4">Enterprise-ready in seconds</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      AI validates, optimizes, and delivers production-ready workflows. No debugging required - just import and run.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-[#EFD09E]/10 rounded-xl p-4 border border-[#EFD09E]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">✓ Validated & optimized</span>
                          <Download className="h-4 w-4 text-[#D4AA7D]" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 text-center">
                        What took 2-8 hours now takes 30 seconds
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-gradient-to-br from-[#272727] to-[#1f1f1f] rounded-2xl p-6 text-white">
                    <div className="text-[#EFD09E] text-sm font-medium mb-2">Step 3</div>
                    <div className="text-lg font-semibold">Production Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-[#EFD09E]/10 to-[#D4AA7D]/10 rounded-3xl p-8 border border-[#EFD09E]/20">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to automate?</h3>
            <p className="text-gray-300 mb-6">Start creating your first workflow in under 5 minutes.</p>
            <button className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] px-8 py-3 rounded-xl font-semibold hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 transform hover:scale-105 shadow-lg">
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}