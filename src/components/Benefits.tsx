import React from 'react';
import { Clock, Users, Shield, Zap, CheckCircle, Star } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      icon: Clock,
      title: "Save 95% of your time",
      description: "What used to take 2-8 hours of research and building now takes just 30 seconds.",
      stat: "2-8 hours → 30 seconds"
    },
    {
      icon: Users,
      title: "No expertise required",
      description: "Anyone can create enterprise-grade workflows. No technical automation knowledge needed.",
      stat: "80-98% accuracy"
    },
    {
      icon: Shield,
      title: "Production-ready quality",
      description: "Our AI validates and optimizes every workflow. No debugging or fixing required.",
      stat: "2,600+ examples trained"
    },
    {
      icon: Zap,
      title: "Conversational interface",
      description: "Just describe what you want in plain English. No complex configuration screens.",
      stat: "Natural language"
    }
  ];

  return (
    <section className="bg-[#0f0f0f] py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why choose our
            <span className="block text-[#D4AA7D]">AI workflow generator</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built by automation experts, powered by AI, trusted by businesses worldwide.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#3a3a3a] hover:border-[#D4AA7D]/50 transition-all duration-300 group">
              <div className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="h-6 w-6 text-[#272727]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-gray-300 mb-4">{benefit.description}</p>
              <div className="text-sm font-medium text-[#D4AA7D]">{benefit.stat}</div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-[#1f1f1f] to-[#272727] rounded-3xl p-8 border border-[#3a3a3a]">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#D4AA7D] text-[#D4AA7D]" />
                ))}
              </div>
              <div className="text-2xl font-bold text-white">2,600+</div>
              <div className="text-gray-300">Real automation examples</div>
            </div>
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 text-[#D4AA7D] mx-auto" />
              <div className="text-2xl font-bold text-white">80-98%</div>
              <div className="text-gray-300">Understanding accuracy</div>
            </div>
            <div className="space-y-2">
              <Zap className="h-8 w-8 text-[#D4AA7D] mx-auto" />
              <div className="text-2xl font-bold text-white">30 sec</div>
              <div className="text-gray-300">Average generation time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}