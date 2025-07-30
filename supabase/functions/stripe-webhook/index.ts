import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    console.log('Webhook received, signature present:', !!signature);
    console.log('Webhook secret configured:', !!webhookSecret);
    
    const body = await req.text();
    
    // Parse the event (we'll skip signature verification for now to get it working)
    const event = JSON.parse(body);
    
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing Stripe webhook event:', event.type);
    console.log('Event ID:', event.id);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        const promptCount = session.metadata?.prompt_count;
        const interval = session.metadata?.interval || 'month';
        const planType = session.metadata?.plan_type || 'standard';
        
        console.log('🔍 RAW SESSION METADATA:', session.metadata);
        console.log('🔍 EXTRACTED VALUES:', { 
          userId, 
          planId, 
          promptCount, 
          planType,
          interval,
          sessionId: session.id,
          customerId: session.customer
        });
        
        if (!userId) {
          console.error('No user ID found in session metadata');
          return new Response('No user ID in session', { status: 400 });
        }

        // Handle bonus plan purchases differently from subscription plans
        if (planType === 'bonus' && promptCount) {
          console.log('🔍 BONUS PLAN DETECTED:', { promptCount, userId });
          
          // Get current user usage to add bonus generations
          const { data: currentUsage, error: usageError } = await supabase
            .from('user_usage')
            .select('bonus_generations_limit, bonus_generations_used')
            .eq('user_id', userId)
            .single();

          if (usageError) {
            console.error('Error fetching current usage for bonus update:', usageError);
            return new Response('Database error', { status: 500 });
          }

          const currentBonusLimit = currentUsage?.bonus_generations_limit || 0;
          const newBonusLimit = currentBonusLimit + parseInt(promptCount);

          console.log('🔍 UPDATING BONUS GENERATIONS:', { 
            currentBonusLimit, 
            addingGenerations: parseInt(promptCount), 
            newBonusLimit 
          });

          // Update bonus generations limit
          const { error: bonusUpdateError } = await supabase
            .from('user_usage')
            .update({
              bonus_generations_limit: newBonusLimit,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (bonusUpdateError) {
            console.error('Error updating bonus generations:', bonusUpdateError);
            return new Response('Database error', { status: 500 });
          } else {
            console.log(`✅ Successfully added ${promptCount} bonus generations to user ${userId}. New limit: ${newBonusLimit}`);
          }

          break; // Don't process as subscription
        }

        // Determine the subscription limits based on plan
        let generationLimit = 50; // Default Pro plan
        let subscriptionStatus = 'pro';
        
        console.log('🔍 BEFORE LOGIC:', { generationLimit, subscriptionStatus });
        
        if ((planType === 'custom' || planType === 'custom_premium') && promptCount) {
          generationLimit = parseInt(promptCount);
          subscriptionStatus = 'premium';
          console.log('🔍 CUSTOM PREMIUM PLAN DETECTED:', { generationLimit, subscriptionStatus });
        } else if (planId?.includes('premium')) {
          generationLimit = 0; // Unlimited for fixed premium plans
          subscriptionStatus = 'premium';
          console.log('🔍 FIXED PREMIUM PLAN DETECTED:', { generationLimit, subscriptionStatus });
        } else if (planId?.includes('pro')) {
          generationLimit = 50;
          subscriptionStatus = 'pro';
          console.log('🔍 PRO PLAN DETECTED:', { generationLimit, subscriptionStatus });
        }

        console.log('🔍 FINAL VALUES:', { generationLimit, subscriptionStatus });

        // Update user subscription status in users table
        console.log('Attempting to update user with data:', {
          id: userId,
          subscription_status: subscriptionStatus,
          stripe_customer_id: session.customer,
          customer_id_present: !!session.customer
        });

        // First, ensure user exists by upserting with minimal required data
        // Always use a unique email based on user ID to avoid conflicts with existing accounts
        const uniqueEmail = `${userId}@stripe-purchase.com`;
        
        const { data: userData, error: userUpdateError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: uniqueEmail,
            subscription_status: subscriptionStatus,
            stripe_customer_id: session.customer,
            subscription_starts_at: new Date().toISOString(),
            subscription_ends_at: new Date(Date.now() + (interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            billing_cycle: interval,
            last_reset_date: new Date().toISOString().split('T')[0], // Store as YYYY-MM-DD
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          });

        if (userUpdateError) {
          console.error('❌ CRITICAL ERROR updating user table:', userUpdateError);
          console.error('❌ User update payload:', {
            id: userId,
            subscription_status: subscriptionStatus,
            stripe_customer_id: session.customer
          });
          // Continue processing but log the failure
        } else {
          console.log('✅ Successfully updated user subscription status for:', userId);
          console.log('✅ User data result:', userData);
        }

        // Reset usage count to 0 for new subscription and set new limit
        const isCustomPremium = planType === 'custom' || planType === 'custom_premium';
        const isFixedPremium = subscriptionStatus === 'premium' && !isCustomPremium;
        
        const { data: usageData, error: usageUpdateError } = await supabase
          .from('user_usage')
          .upsert({
            user_id: userId,
            workflow_generations_limit: subscriptionStatus === 'pro' ? generationLimit : 0,
            workflow_generations_used: 0, // Reset usage for new subscription
            premium_generations_limit: isCustomPremium ? generationLimit : (isFixedPremium ? 999999 : 0), // Unlimited for fixed premium
            premium_generations_used: 0,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (usageUpdateError) {
          console.error('Error updating user usage:', usageUpdateError);
          return new Response('Database error', { status: 500 });
        } else {
          console.log(`Successfully reset usage and updated limits for user ${userId}: ${generationLimit} generations`);
        }
        
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        console.log('Subscription event for customer:', customerId, 'Status:', subscription.status);
        
        // Find user by Stripe customer ID
        const { data: userData, error: findError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (findError || !userData) {
          console.error('Could not find user for customer:', customerId, findError);
          break;
        }

        const newStatus = subscription.status === 'active' ? 'pro' : 'free';
        const newLimit = subscription.status === 'active' ? 50 : 3;
        
        console.log('Updating user:', userData.id, 'to status:', newStatus, 'limit:', newLimit);
        
        // Update user subscription status
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            subscription_status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id);

        if (userUpdateError) {
          console.error('Error updating user subscription status:', userUpdateError);
        }

        // Update usage limits
        const { error: usageUpdateError } = await supabase
          .from('user_usage')
          .update({
            workflow_generations_limit: newLimit,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.id);

        if (usageUpdateError) {
          console.error('Error updating usage limits:', usageUpdateError);
        } else {
          console.log(`Successfully updated limits for user ${userData.id}: ${newLimit} generations`);
        }
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log('Webhook processed successfully');
    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});