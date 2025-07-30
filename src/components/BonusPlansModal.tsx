import React, { useState } from 'react';
import { X, Zap, Crown } from 'lucide-react';
import { StripeService } from '../services/stripe';

interface BonusPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentUsage: {
    workflow_used: number;
    workflow_limit: number;
    bonus_used: number;
    bonus_limit: number;
  };
}

interface BonusPlan {
  id: string;
  generations: number;
  price: number;
  priceId: string;
  popular?: boolean;
}

const bonusPlans: BonusPlan[] = [
  {
    id: '25-gens',
    generations: 25,
    price: 7,
    priceId: 'price_1Rqg06Kxt1K8sHTsyzBFUrrh'
  },
  {
    id: '50-gens',
    generations: 50,
    price: 15,
    priceId: 'price_1Rqg08Kxt1K8sHTs8iLG2exl',
    popular: true
  },
  {
    id: '100-gens',
    generations: 100,
    price: 30,
    priceId: 'price_1Rqg0BKxt1K8sHTsw6fqRMIF'
  },
  {
    id: '200-gens',
    generations: 200,
    price: 60,
    priceId: 'price_1Rqg0DKxt1K8sHTsL1ZX912S'
  },
  {
    id: '500-gens',
    generations: 500,
    price: 100,
    priceId: 'price_1Rqg0GKxt1K8sHTsbp7oTn4v'
  }
];

export default function BonusPlansModal({ isOpen, onClose, userId, currentUsage }: BonusPlansModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (plan: BonusPlan) => {
    setLoading(plan.id);
    
    try {
      console.log('Purchasing bonus plan:', plan);
      
      // Use the bonus checkout session for one-time payments
      const response = await fetch('https://asljibfralcdthkuqosh.supabase.co/functions/v1/create-bonus-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbGppYmZyYWxjZHRoa3Vxb3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTUzMTEsImV4cCI6MjA2NzEzMTMxMX0.9E-p0fzLzlTTy3158BvQr65b9pHKjpjBK8T5JlHv7KA'
        },
        body: JSON.stringify({
          amount: plan.price * 100, // Convert to cents
          currency: 'usd',
          promptCount: plan.generations,
          userId,
          productName: `${plan.generations} Bonus Generations`,
          successUrl: `${window.location.origin}/?bonus_success=true`,
          cancelUrl: `${window.location.origin}/?bonus_canceled=true`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const { sessionId } = await response.json();

      if (sessionId) {
        // Redirect to Stripe Checkout
        const stripe = await StripeService.getStripe();
        await stripe?.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error purchasing bonus plan:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const calculateValuePerGen = (generations: number, price: number) => {
    return (price / generations).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-xl border border-[#3a3a3a] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="text-[#EFD09E]" size={24} />
              Buy More Generations
            </h2>
            <p className="text-gray-400 mt-1">
              Add bonus generations to your account (resets with your billing cycle)
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Current Usage */}
        <div className="p-6 border-b border-[#3a3a3a] bg-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white mb-3">Current Usage</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#3a3a3a]">
              <div className="text-sm text-gray-400">Regular Generations</div>
              <div className="text-2xl font-bold text-white">
                {currentUsage.workflow_used}/{currentUsage.workflow_limit}
              </div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#3a3a3a]">
              <div className="text-sm text-gray-400">Bonus Generations</div>
              <div className="text-2xl font-bold text-[#EFD09E]">
                {currentUsage.bonus_used}/{currentUsage.bonus_limit}
              </div>
            </div>
          </div>
        </div>

        {/* Bonus Plans */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Choose Your Bonus Pack</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bonusPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative bg-[#2a2a2a] rounded-lg border p-6 transition-all hover:border-[#EFD09E] ${
                  plan.popular ? 'border-[#EFD09E] ring-1 ring-[#EFD09E]' : 'border-[#3a3a3a]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Crown size={12} />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {plan.generations}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    Bonus Generations
                  </div>
                  
                  <div className="text-2xl font-bold text-[#EFD09E] mb-1">
                    ${plan.price}
                  </div>
                  <div className="text-xs text-gray-400 mb-4">
                    ${calculateValuePerGen(plan.generations, plan.price)}/generation
                  </div>

                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={loading === plan.id}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] hover:from-[#D4AA7D] hover:to-[#c19660]'
                        : 'bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]'
                    } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === plan.id ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#3a3a3a] bg-[#2a2a2a] text-center">
          <p className="text-sm text-gray-400">
            💡 Bonus generations reset with your billing cycle and are consumed after your regular generations
          </p>
        </div>
      </div>
    </div>
  );
}