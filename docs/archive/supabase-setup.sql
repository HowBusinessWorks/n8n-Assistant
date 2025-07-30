-- ==============================================
-- SUPABASE PRODUCTION SETUP SCRIPT
-- Run this in Supabase Dashboard → SQL Editor
-- ==============================================

-- Create users table for authentication and subscription tracking
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Clerk user ID
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    image_url TEXT,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'pro', 'enterprise')),
    subscription_starts_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_usage table for tracking workflow generations
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workflow_generations_used INTEGER DEFAULT 0,
    workflow_generations_limit INTEGER DEFAULT 3, -- 3 free for all users
    premium_generations_used INTEGER DEFAULT 0,
    premium_generations_limit INTEGER DEFAULT 0,
    last_generation_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create usage_logs table for detailed tracking
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('workflow_generation', 'api_call', 'export', 'subscription_change')),
    request_id UUID REFERENCES user_requests(id),
    metadata JSONB DEFAULT '{}',
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at 
    BEFORE UPDATE ON user_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- Users can only see their own usage data
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid()::text = user_id);

-- Users can only see their own usage logs
CREATE POLICY "Users can view own logs" ON usage_logs
    FOR SELECT USING (auth.uid()::text = user_id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access user_usage" ON user_usage
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access usage_logs" ON usage_logs
    FOR ALL USING (auth.role() = 'service_role');

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to get user's workflow generation count
CREATE OR REPLACE FUNCTION get_user_workflow_count(p_user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM user_requests 
        WHERE user_id = p_user_id AND success = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or update user
CREATE OR REPLACE FUNCTION upsert_user(
    p_user_id TEXT,
    p_email TEXT,
    p_first_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL
)
RETURNS users AS $$
DECLARE
    result_user users;
BEGIN
    INSERT INTO users (id, email, first_name, last_name, image_url)
    VALUES (p_user_id, p_email, p_first_name, p_last_name, p_image_url)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
    RETURNING * INTO result_user;
    
    -- Ensure user_usage record exists
    INSERT INTO user_usage (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN result_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment user usage
CREATE OR REPLACE FUNCTION increment_user_usage(p_user_id TEXT)
RETURNS user_usage AS $$
DECLARE
    result_usage user_usage;
BEGIN
    UPDATE user_usage 
    SET 
        workflow_generations_used = workflow_generations_used + 1,
        last_generation_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO result_usage;
    
    -- Log the usage
    INSERT INTO usage_logs (user_id, action_type, metadata)
    VALUES (p_user_id, 'workflow_generation', '{"source": "frontend"}');
    
    RETURN result_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_workflow_count(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION upsert_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_user_usage(TEXT) TO authenticated, anon;

-- ==============================================
-- TEST DATA (OPTIONAL)
-- ==============================================

-- Insert a test user (uncomment to create)
-- SELECT upsert_user(
--     'test_user_123',
--     'test@example.com',
--     'Test',
--     'User',
--     'https://example.com/avatar.jpg'
-- );

COMMIT;