-- User Subscriptions Setup for Stripe Integration
-- Run this in your Supabase SQL Editor

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'free',
  plan_type TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'active',
  generation_limit INTEGER NOT NULL DEFAULT 3,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own subscription
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

-- Policy: Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);

-- Update existing user_usage table to work with subscriptions
-- Add a function to check generation limits based on subscription
CREATE OR REPLACE FUNCTION get_user_generation_limit(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  subscription_limit INTEGER;
BEGIN
  -- Get the generation limit from user subscription
  SELECT generation_limit INTO subscription_limit
  FROM user_subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  -- If no active subscription found, return free tier limit
  IF subscription_limit IS NULL THEN
    RETURN 3;
  END IF;
  
  RETURN subscription_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user can generate workflows
CREATE OR REPLACE FUNCTION can_user_generate_workflow(p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  generation_limit INTEGER;
BEGIN
  -- Get current usage
  SELECT COALESCE(total_generations, 0) INTO current_usage
  FROM user_usage
  WHERE user_id = p_user_id;
  
  -- Get generation limit from subscription
  SELECT get_user_generation_limit(p_user_id) INTO generation_limit;
  
  -- Return true if user hasn't exceeded limit
  RETURN current_usage < generation_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;