-- Fix: set search_path to prevent mutable path security issue

CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_action TEXT,
    p_max_requests INTEGER,
    p_window_hours INTEGER DEFAULT 6
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
    v_allowed BOOLEAN;
    v_remaining INTEGER;
BEGIN
    v_window_start := date_trunc('day', NOW()) +
        (FLOOR(EXTRACT(HOUR FROM NOW()) / p_window_hours) * p_window_hours) * INTERVAL '1 hour';

    INSERT INTO rate_limits (user_id, action, window_start, count)
    VALUES (p_user_id, p_action, v_window_start, 1)
    ON CONFLICT (user_id, action, window_start)
    DO UPDATE SET count = rate_limits.count + 1
    RETURNING count INTO v_current_count;

    v_allowed := v_current_count < p_max_requests;
    v_remaining := GREATEST(0, p_max_requests - v_current_count);

    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '48 hours';

    RETURN json_build_object('allowed', v_allowed, 'remaining', v_remaining);
END;
$$;
