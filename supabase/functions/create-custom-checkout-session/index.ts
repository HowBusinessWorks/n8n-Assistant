import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  amount: number;
  currency: string;
  promptCount: number;
  userId: string;
  interval: string;
  productName: string;
  successUrl: string;
  cancelUrl: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔧 Custom checkout session request received');

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-08-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Parse request body
    const body: CheckoutRequest = await req.json();
    const { amount, currency, promptCount, userId, interval, productName, successUrl, cancelUrl } = body;

    console.log('📋 Custom checkout request:', { 
      amount, 
      currency, 
      promptCount, 
      userId, 
      interval,
      productName 
    });

    // Validate required fields
    if (!amount || !currency || !promptCount || !userId || !interval) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a custom product for this specific subscription
    const product = await stripe.products.create({
      name: productName || `${promptCount.toLocaleString()} Workflow Generations`,
      description: `Custom premium plan with ${promptCount.toLocaleString()} workflow generations per ${interval}`,
      metadata: {
        type: 'custom_premium',
        prompt_count: promptCount.toString(),
        user_id: userId,
        interval: interval
      }
    });

    console.log('✅ Created custom product:', product.id);

    // Create a price for this product
    const unitAmountInCents = amount * 100;
    
    const price = await stripe.prices.create({
      unit_amount: unitAmountInCents, // Convert to cents
      currency: currency,
      recurring: {
        interval: interval as 'month' | 'year',
      },
      product: product.id,
      metadata: {
        prompt_count: promptCount.toString(),
        user_id: userId,
        plan_type: 'custom_premium'
      }
    });

    console.log('✅ Created custom price:', price.id);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: undefined, // Let Stripe handle customer creation
      metadata: {
        user_id: userId,
        plan_type: 'custom_premium',
        prompt_count: promptCount.toString(),
        interval: interval,
        amount: amount.toString()
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_type: 'custom_premium',
          prompt_count: promptCount.toString(),
          interval: interval
        }
      }
    });

    console.log('✅ Created custom checkout session:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error creating custom checkout session:', error);
    
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});