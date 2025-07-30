import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 15,
    interval: 'month',
    features: ['50 workflow generations per month', 'Priority support', 'Advanced templates'],
    stripePriceId: 'price_1RpuADKxt1K8sHTsPv1YBuD5'
  },
  {
    id: 'pro_yearly',
    name: 'Pro (Yearly)',
    price: 120,
    interval: 'year',
    features: ['50 workflow generations per month', 'Priority support', 'Advanced templates', '20% discount'],
    stripePriceId: 'price_1RpuB1Kxt1K8sHTsXVLqMohz'
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    price: 49,
    interval: 'month',
    features: ['Unlimited workflow generations', 'Premium support', 'Custom integrations'],
    stripePriceId: 'price_PREMIUM_MONTHLY_TO_BE_CREATED' // TODO: Replace with actual production Stripe price ID
  },
  {
    id: 'premium_yearly',
    name: 'Premium (Yearly)',
    price: 490,
    interval: 'year',
    features: ['Unlimited workflow generations', 'Premium support', 'Custom integrations', '30% discount'],
    stripePriceId: 'price_PREMIUM_YEARLY_TO_BE_CREATED' // TODO: Replace with actual production Stripe price ID
  }
];

export class StripeService {
  /**
   * Redirect to Stripe Checkout for subscription
   */
  static async createCheckoutSession(planId: string, userId: string): Promise<void> {
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      console.log('Creating Stripe checkout session for:', { planId, userId, stripePriceId: plan.stripePriceId });
      
      // Call Supabase Edge Function to create checkout session
      const response = await fetch('https://asljibfralcdthkuqosh.supabase.co/functions/v1/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbGppYmZyYWxjZHRoa3Vxb3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTUzMTEsImV4cCI6MjA2NzEzMTMxMX0.9E-p0fzLzlTTy3158BvQr65b9pHKjpjBK8T5JlHv7KA',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbGppYmZyYWxjZHRoa3Vxb3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTUzMTEsImV4cCI6MjA2NzEzMTMxMX0.9E-p0fzLzlTTy3158BvQr65b9pHKjpjBK8T5JlHv7KA'
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: userId,
          planId: planId,
          successUrl: `${window.location.origin}/chat?success=true`,
          cancelUrl: `${window.location.origin}/chat?canceled=true`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const { sessionId } = await response.json();
      
      if (!sessionId) {
        throw new Error('No session ID returned from server');
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message || 'Failed to redirect to checkout');
      }
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`Payment Error: ${error.message}`);
      } else {
        alert('An error occurred while processing your payment. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Create a custom checkout session (for dynamic pricing)
   */
  static async createCustomCheckoutSession(params: {
    amount: number;
    currency?: string;
    promptCount: number;
    userId: string;
    interval?: string;
    productName?: string;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ sessionId: string }> {
    try {
      const response = await fetch('https://asljibfralcdthkuqosh.supabase.co/functions/v1/create-custom-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbGppYmZyYWxjZHRoa3Vxb3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTUzMTEsImV4cCI6MjA2NzEzMTMxMX0.9E-p0fzLzlTTy3158BvQr65b9pHKjpjBK8T5JlHv7KA',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbGppYmZyYWxjZHRoa3Vxb3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTUzMTEsImV4cCI6MjA2NzEzMTMxMX0.9E-p0fzLzlTTy3158BvQr65b9pHKjpjBK8T5JlHv7KA'
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || 'usd',
          promptCount: params.promptCount,
          userId: params.userId,
          interval: params.interval || 'month',
          productName: params.productName || `${params.promptCount.toLocaleString()} Workflow Generations`,
          successUrl: params.successUrl || `${window.location.origin}/chat?success=true`,
          cancelUrl: params.cancelUrl || `${window.location.origin}/chat?canceled=true`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const { sessionId } = await response.json();
      
      if (!sessionId) {
        throw new Error('No session ID returned from server');
      }

      return { sessionId };
      
    } catch (error) {
      console.error('Error creating custom checkout session:', error);
      throw error;
    }
  }

  /**
   * Get plan by ID
   */
  static getPlan(planId: string): SubscriptionPlan | undefined {
    return subscriptionPlans.find(p => p.id === planId);
  }

  /**
   * Get all available plans
   */
  static getAllPlans(): SubscriptionPlan[] {
    return subscriptionPlans;
  }

  /**
   * Get Stripe instance
   */
  static async getStripe() {
    return await stripePromise;
  }
}

export default StripeService;