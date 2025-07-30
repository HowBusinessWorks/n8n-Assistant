-- Phase 1: Database Schema Updates for Bonus Plans and Billing Cycles
-- Run this SQL in your Supabase SQL editor

-- Add bonus generation fields to user_usage table
ALTER TABLE user_usage 
ADD COLUMN IF NOT EXISTS bonus_generations_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_generations_used INTEGER DEFAULT 0;

-- Add billing cycle tracking and reset date to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_reset_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'month';

-- Add constraint to ensure billing_cycle is valid
ALTER TABLE users 
ADD CONSTRAINT billing_cycle_check 
CHECK (billing_cycle IN ('month', 'year'));

-- Create index for better performance on reset queries
CREATE INDEX IF NOT EXISTS idx_users_billing_cycle ON users(billing_cycle);
CREATE INDEX IF NOT EXISTS idx_users_last_reset_date ON users(last_reset_date);

-- Update existing users to have proper reset dates and monthly billing
UPDATE users 
SET 
  last_reset_date = CURRENT_DATE,
  billing_cycle = 'month'
WHERE last_reset_date IS NULL OR billing_cycle IS NULL;

-- Verify the changes
SELECT 
  'user_usage columns' as table_info,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_usage' 
  AND column_name IN ('bonus_generations_limit', 'bonus_generations_used')

UNION ALL

SELECT 
  'users columns' as table_info,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('last_reset_date', 'billing_cycle')

ORDER BY table_info, column_name;