-- Update rate limit RPC to support variable window sizes (e.g., 6 hours)
-- Previous version used date_trunc('hour') which only worked for 1h windows

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
    v_epoch BIGINT;
    v_window_seconds BIGINT;
BEGIN
    -- Calculate window start based on p_window_hours
    v_window_seconds := p_window_hours * 3600;
    v_epoch := EXTRACT(EPOCH FROM NOW())::BIGINT;
    v_window_start := TO_TIMESTAMP((v_epoch / v_window_seconds) * v_window_seconds);

    -- Upsert: increment counter or insert new row
    INSERT INTO rate_limits (user_id, action, window_start, count)
    VALUES (p_user_id, p_action, v_window_start, 1)
    ON CONFLICT (user_id, action, window_start)
    DO UPDATE SET count = rate_limits.count + 1
    RETURNING count INTO v_current_count;

    v_allowed := v_current_count <= p_max_requests;
    v_remaining := GREATEST(0, p_max_requests - v_current_count);

    -- Cleanup old windows (older than 48h) — opportunistic
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '48 hours';

    RETURN json_build_object('allowed', v_allowed, 'remaining', v_remaining);
END;
$$;
