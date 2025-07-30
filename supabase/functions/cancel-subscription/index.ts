import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

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
    console.log('Cancel subscription request received');
    
    // Parse request body
    const { userId } = await req.json();
    
    if (!userId) {
      console.error('No user ID provided');
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('Processing cancellation for user:', userId);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Stripe secret key not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's Stripe customer ID from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_status')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error finding user:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    if (!userData.stripe_customer_id) {
      console.error('No Stripe customer ID found for user');
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    if (userData.subscription_status === 'free') {
      console.log('User already on free plan');
      return new Response(
        JSON.stringify({ error: 'No active subscription to cancel' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('Finding active subscriptions for customer:', userData.stripe_customer_id);

    // Get all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      console.log('No active subscriptions found in Stripe');
      
      // Update user to free status in database since no active subscription exists
      await supabase
        .from('users')
        .update({
          subscription_status: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Reset all usage limits to free tier, including bonus generations
      await supabase
        .from('user_usage')
        .update({
          workflow_generations_limit: 3,
          premium_generations_limit: 0,
          bonus_generations_limit: 0,
          bonus_generations_used: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return new Response(
        JSON.stringify({ error: 'No active subscription found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Cancel all active subscriptions
    const cancelPromises = subscriptions.data.map(subscription => {
      console.log('Canceling subscription:', subscription.id);
      return stripe.subscriptions.cancel(subscription.id);
    });

    await Promise.all(cancelPromises);

    console.log(`Successfully canceled ${subscriptions.data.length} subscription(s)`);

    // Update user status to free in database
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        subscription_status: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('Error updating user status:', userUpdateError);
    }

    // Reset all usage limits to free tier, including bonus generations
    const { error: usageUpdateError } = await supabase
      .from('user_usage')
      .update({
        workflow_generations_limit: 3,
        premium_generations_limit: 0,
        bonus_generations_limit: 0,
        bonus_generations_used: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (usageUpdateError) {
      console.error('Error updating usage limits:', usageUpdateError);
    }

    console.log('Successfully updated user to free tier');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription canceled successfully',
        canceledSubscriptions: subscriptions.data.length
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to cancel subscription'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});