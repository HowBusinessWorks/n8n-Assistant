-- ==============================================
-- CHAT SESSIONS LINK MIGRATION
-- Run this AFTER the main chat-sessions-migration.sql
-- ==============================================

-- Add session_id column to link to user_requests table
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create index for session_id lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);

-- Add foreign key constraint (optional - helps with data integrity)
-- Note: This might fail if there are existing sessions without matching user_requests
-- ALTER TABLE chat_sessions 
-- ADD CONSTRAINT fk_chat_sessions_user_requests 
-- FOREIGN KEY (session_id) REFERENCES user_requests(session_id);

COMMIT;