import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowRequest {
  session_id: string;
  user_input: string;
  user_id: string;
}

interface WorkflowAPIResponse {
  success: boolean;
  message?: string;
  pipeline_status?: string;
  session_id?: string;
  confidence_score?: number;
  final_workflow?: object;
  edited_workflow?: object;
  corrected_workflow?: object;
  intent_parsing?: any;
  rag_retrieval?: any;
  workflow_generation?: any;
  validation?: any;
  import_ready?: boolean;
  next_steps?: string[];
  processing_summary?: any;
  error?: boolean;
}

// Rate limiting disabled for testing
// const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
// const RATE_LIMIT_PER_MINUTE = 20;
// const RATE_LIMIT_WINDOW = 60 * 1000;

// Helper function to check if billing cycle needs reset
async function checkAndResetBillingCycle(supabase: any, userId: string, userInfo: any): Promise<boolean> {
  const { subscription_status, billing_cycle, last_reset_date, subscription_starts_at } = userInfo;
  
  // Only reset for paid users
  if (subscription_status === 'free' || !billing_cycle || !subscription_starts_at) {
    return false;
  }

  const now = new Date();
  const lastReset = last_reset_date ? new Date(last_reset_date) : null;
  const subscriptionStart = new Date(subscription_starts_at);
  
  console.log('🔍 Billing cycle check:', { 
    billing_cycle, 
    last_reset_date, 
    subscription_starts_at,
    now: now.toISOString()
  });

  let shouldReset = false;
  let nextResetDate = new Date();

  if (billing_cycle === 'month') {
    // Calculate next monthly reset date
    if (lastReset) {
      nextResetDate = new Date(lastReset);
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
    } else {
      // Use subscription start date for first reset calculation
      nextResetDate = new Date(subscriptionStart);
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
    }
    shouldReset = now >= nextResetDate;
  } else if (billing_cycle === 'year') {
    // Calculate next yearly reset date
    if (lastReset) {
      nextResetDate = new Date(lastReset);
      nextResetDate.setFullYear(nextResetDate.getFullYear() + 1);
    } else {
      // Use subscription start date for first reset calculation
      nextResetDate = new Date(subscriptionStart);
      nextResetDate.setFullYear(nextResetDate.getFullYear() + 1);
    }
    shouldReset = now >= nextResetDate;
  }

  if (shouldReset) {
    console.log('🔄 Resetting billing cycle for user:', userId);
    
    try {
      // Reset usage counts but preserve limits (including bonus_generations_limit)
      const { error: usageError } = await supabase
        .from('user_usage')
        .update({
          workflow_generations_used: 0,
          premium_generations_used: 0,
          bonus_generations_used: 0, // Reset bonus usage but keep bonus_generations_limit
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (usageError) {
        console.error('❌ Error resetting usage:', usageError);
        return false;
      }

      // Update last reset date
      const { error: userError } = await supabase
        .from('users')
        .update({
          last_reset_date: now.toISOString().split('T')[0], // Store as YYYY-MM-DD
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (userError) {
        console.error('❌ Error updating reset date:', userError);
        return false;
      }

      console.log('✅ Billing cycle reset successful for user:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error during billing cycle reset:', error);
      return false;
    }
  }

  console.log('✅ No billing cycle reset needed');
  return false;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔧 Workflow generation request received');
    
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get userId from request body (temporary fix)
    const requestBody = await req.json();
    const { session_id, user_input, user_id } = requestBody;
    
    if (!user_id || !session_id || !user_input) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userId = user_id;
    console.log('✅ Using userId from request:', userId);

    // 2. Get user subscription and usage data
    const { data: userInfo, error: userError } = await supabase
      .from('users')
      .select('subscription_status, billing_cycle, last_reset_date, subscription_starts_at')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ Error fetching user info:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: usageInfo, error: usageError } = await supabase
      .from('user_usage')
      .select('workflow_generations_used, workflow_generations_limit, premium_generations_used, premium_generations_limit, bonus_generations_used, bonus_generations_limit')
      .eq('user_id', userId)
      .single();

    if (usageError) {
      console.error('❌ Error fetching usage info:', usageError);
      return new Response(
        JSON.stringify({ error: 'Usage data not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 3. Check if billing cycle needs to be reset
    const shouldResetBillingCycle = await checkAndResetBillingCycle(supabase, userId, userInfo);
    let currentUsageInfo = usageInfo;
    
    // If we reset the billing cycle, fetch fresh usage data
    if (shouldResetBillingCycle) {
      console.log('🔄 Billing cycle was reset, fetching fresh usage data');
      const { data: freshUsageInfo, error: freshUsageError } = await supabase
        .from('user_usage')
        .select('workflow_generations_used, workflow_generations_limit, premium_generations_used, premium_generations_limit, bonus_generations_used, bonus_generations_limit')
        .eq('user_id', userId)
        .single();
      
      if (!freshUsageError && freshUsageInfo) {
        currentUsageInfo = freshUsageInfo;
      }
    }

    // 4. Check usage limits
    const subscriptionStatus = userInfo.subscription_status;
    const workflowUsed = currentUsageInfo.workflow_generations_used || 0;
    const workflowLimit = currentUsageInfo.workflow_generations_limit || 0;
    const premiumUsed = currentUsageInfo.premium_generations_used || 0;
    const premiumLimit = currentUsageInfo.premium_generations_limit || 0;
    const bonusUsed = currentUsageInfo.bonus_generations_used || 0;
    const bonusLimit = currentUsageInfo.bonus_generations_limit || 0;

    console.log('📊 Usage check:', {
      subscriptionStatus,
      workflowUsed,
      workflowLimit,
      premiumUsed,
      premiumLimit,
      bonusUsed,
      bonusLimit
    });

    // Determine if user has available generations (premium > regular > bonus)
    let hasAvailableGenerations = false;
    let usingPremium = false;
    let usingBonus = false;

    if (subscriptionStatus === 'premium' && premiumUsed < premiumLimit) {
      // Premium users: Use premium generations first
      hasAvailableGenerations = true;
      usingPremium = true;
    } else if (subscriptionStatus === 'premium' && bonusUsed < bonusLimit) {
      // Premium users who exhausted premium: Use bonus generations
      hasAvailableGenerations = true;
      usingPremium = false;
      usingBonus = true;
    } else if (subscriptionStatus !== 'premium' && workflowUsed < workflowLimit) {
      // Pro/Free users: Use workflow generations first
      hasAvailableGenerations = true;
      usingPremium = false;
    } else if (subscriptionStatus !== 'premium' && bonusUsed < bonusLimit) {
      // Pro users who exhausted workflow: Use bonus generations
      hasAvailableGenerations = true;
      usingPremium = false;
      usingBonus = true;
    }

    if (!hasAvailableGenerations) {
      console.error('❌ Usage limit exceeded for user:', userId);
      return new Response(
        JSON.stringify({ 
          error: 'Generation limit exceeded. Please upgrade your plan or wait for your limit to reset.',
          usage: {
            workflow_used: workflowUsed,
            workflow_limit: workflowLimit,
            premium_used: premiumUsed,
            premium_limit: premiumLimit,
            subscription_status: subscriptionStatus
          }
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 5. Validate request data (already parsed above)

    if (typeof user_input !== 'string') {
      console.error('❌ Invalid user_input type');
      return new Response(
        JSON.stringify({ error: 'Invalid user_input format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate input length
    if (user_input.length > 2000) {
      console.error('❌ Input too long');
      return new Response(
        JSON.stringify({ error: 'Input too long. Maximum 2000 characters allowed.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Request validated:', { session_id, input_length: user_input.length });

    // 6. Get the n8n API base URL from environment
    const n8nApiUrl = Deno.env.get('N8N_API_BASE_URL');
    if (!n8nApiUrl) {
      console.error('❌ N8N_API_BASE_URL environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Workflow generation service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 7. Make the API call to n8n workflow
    console.log('🔄 Calling n8n workflow API...');
    const n8nResponse = await fetch(`${n8nApiUrl}/webhook/chat-router`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id,
        user_input,
        user_id: userId,
      }),
    });

    if (!n8nResponse.ok) {
      console.error('❌ n8n API error:', n8nResponse.status, n8nResponse.statusText);
      return new Response(
        JSON.stringify({ error: 'Workflow generation failed. Please try again.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const workflowResult: WorkflowAPIResponse = await n8nResponse.json();
    console.log('✅ n8n API response received:', workflowResult.success);

    // 8. Update usage counter atomically (only if the workflow generation was successful)
    if (workflowResult.success) {
      try {
        if (usingPremium) {
          const { error: updateError } = await supabase
            .from('user_usage')
            .update({
              premium_generations_used: premiumUsed + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('⚠️ Failed to update premium usage counter:', updateError);
          } else {
            console.log('✅ Premium usage updated:', premiumUsed + 1);
          }
        } else if (usingBonus) {
          const { error: updateError } = await supabase
            .from('user_usage')
            .update({
              bonus_generations_used: bonusUsed + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('⚠️ Failed to update bonus usage counter:', updateError);
          } else {
            console.log('✅ Bonus usage updated:', bonusUsed + 1);
          }
        } else {
          const { error: updateError } = await supabase
            .from('user_usage')
            .update({
              workflow_generations_used: workflowUsed + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('⚠️ Failed to update workflow usage counter:', updateError);
          } else {
            console.log('✅ Workflow usage updated:', workflowUsed + 1);
          }
        }
      } catch (updateError) {
        console.error('⚠️ Error updating usage:', updateError);
      }

      // 9. Log the successful generation for audit trail
      try {
        const { error: logError } = await supabase
          .from('generation_logs')
          .insert({
            user_id: userId,
            session_id,
            input_text: user_input.substring(0, 500), // Store first 500 chars for audit
            success: workflowResult.success,
            generation_type: usingPremium ? 'premium' : usingBonus ? 'bonus' : 'workflow',
            created_at: new Date().toISOString()
          });

        if (logError) {
          console.error('⚠️ Failed to log generation:', logError);
        } else {
          console.log('✅ Generation logged for audit');
        }
      } catch (logError) {
        console.error('⚠️ Error logging generation:', logError);
      }
    }

    // 10. Return the workflow result
    return new Response(
      JSON.stringify(workflowResult),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in generate-workflow:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});