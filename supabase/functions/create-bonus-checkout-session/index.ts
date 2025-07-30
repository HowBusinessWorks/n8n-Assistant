import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, currency, promptCount, userId, productName, successUrl, cancelUrl } = await req.json();

    console.log('Bonus checkout request:', { amount, currency, promptCount, userId, productName });

    if (!amount || !userId || !promptCount) {
      console.error('Missing required fields:', { amount: !!amount, userId: !!userId, promptCount: !!promptCount });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Stripe with secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Stripe secret key not configured');
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Creating one-time Stripe product for bonus generations');

    // Create a product for the bonus generations (one-time purchase)
    const productResponse = await fetch('https://api.stripe.com/v1/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'name': productName || `${promptCount} Bonus Generations`,
        'description': `One-time purchase of ${promptCount} bonus workflow generations`,
        'type': 'service'
      })
    });

    if (!productResponse.ok) {
      const errorText = await productResponse.text();
      console.error('Stripe product creation error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create product' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const product = await productResponse.json();
    console.log('Created product:', product.id);

    // Create one-time price (no recurring interval)
    const priceResponse = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'unit_amount': amount.toString(),
        'currency': currency || 'usd',
        'product': product.id
        // No recurring field = one-time payment
      })
    });

    if (!priceResponse.ok) {
      const errorText = await priceResponse.text();
      console.error('Stripe price creation error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create price' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const price = await priceResponse.json();
    console.log('Created one-time price:', price.id);

    // Create Stripe checkout session for one-time payment
    const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[0]': 'card',
        'line_items[0][price]': price.id,
        'line_items[0][quantity]': '1',
        'mode': 'payment', // One-time payment, not subscription
        'success_url': successUrl,
        'cancel_url': cancelUrl,
        'client_reference_id': userId,
        'metadata[user_id]': userId,
        'metadata[prompt_count]': promptCount.toString(),
        'metadata[plan_type]': 'bonus',
      })
    });

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text();
      console.error('Stripe session creation error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout session' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const session = await sessionResponse.json();
    console.log('Created bonus checkout session:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});