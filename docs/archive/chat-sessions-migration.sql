-- ==============================================
-- CHAT SESSIONS MIGRATION
-- Run this in Supabase Dashboard → SQL Editor
-- ==============================================

-- Create chat_sessions table for storing user chat conversations
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY, -- Frontend-generated chat ID
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    messages JSONB DEFAULT '[]' NOT NULL, -- Array of message objects
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own chat sessions
CREATE POLICY "Users can view own chats" ON chat_sessions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own chats" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own chats" ON chat_sessions
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own chats" ON chat_sessions
    FOR DELETE USING (auth.uid()::text = user_id);

-- Service role full access for admin operations
CREATE POLICY "Service role full access chat_sessions" ON chat_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON chat_sessions TO authenticated, anon;

COMMIT;