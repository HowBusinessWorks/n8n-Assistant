-- Create generation_logs table for audit trail
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  input_text TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('workflow', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_generation_logs_user_id ON generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_generation_logs_session_id ON generation_logs(session_id);

-- Enable RLS
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy so users can only see their own logs
CREATE POLICY "Users can view their own generation logs" ON generation_logs
  FOR SELECT USING (user_id = auth.uid()::text);