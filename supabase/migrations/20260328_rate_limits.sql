-- Rate limiting table for AI Edge Functions
-- Tracks request counts per user per action per hourly window

CREATE TABLE IF NOT EXISTS rate_limits (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, action, window_start)
);

-- Index for cleanup of old windows
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- RPC: Atomic check + increment rate limit
-- Returns: {allowed: boolean, remaining: integer}
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_action TEXT,
    p_max_requests INTEGER,
    p_window_hours INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
    v_allowed BOOLEAN;
    v_remaining INTEGER;
BEGIN
    -- Calculate current window start (rounded to hour)
    v_window_start := date_trunc('hour', NOW());

    -- Upsert: increment counter or insert new row
    INSERT INTO rate_limits (user_id, action, window_start, count)
    VALUES (p_user_id, p_action, v_window_start, 1)
    ON CONFLICT (user_id, action, window_start)
    DO UPDATE SET count = rate_limits.count + 1
    RETURNING count INTO v_current_count;

    v_allowed := v_current_count <= p_max_requests;
    v_remaining := GREATEST(0, p_max_requests - v_current_count);

    -- Cleanup old windows (older than 24h) — opportunistic
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '24 hours';

    RETURN json_build_object('allowed', v_allowed, 'remaining', v_remaining);
END;
$$;

-- RLS: Users cannot read/write rate_limits directly
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies = no direct access. Only via RPC (SECURITY DEFINER).
