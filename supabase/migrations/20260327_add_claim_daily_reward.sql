-- GF-151: RPC funkce pro claim daily reward
-- Volána z useDailyReward.ts: supabase.rpc('claim_daily_reward', { user_id, streak })

CREATE OR REPLACE FUNCTION public.claim_daily_reward(user_id UUID, streak INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    reward_amount INTEGER;
    current_balance INTEGER;
BEGIN
    -- Ověř že uživatel existuje
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;

    -- Ověř že reward nebyl dnes už claimnut
    IF EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND last_claim_date IS NOT NULL
        AND last_claim_date >= date_trunc('day', now())
    ) THEN
        RETURN json_build_object('success', false, 'message', 'Already claimed today');
    END IF;

    -- Reward: 30 každý 7. den, jinak 10
    IF streak % 7 = 0 THEN
        reward_amount := 30;
    ELSE
        reward_amount := 10;
    END IF;

    -- Aktualizuj profil: streak, datum, energie
    UPDATE profiles
    SET
        claim_streak = streak,
        last_claim_date = now(),
        energy_balance = COALESCE(energy_balance, 0) + reward_amount,
        updated_at = now()
    WHERE id = user_id;

    SELECT energy_balance INTO current_balance FROM profiles WHERE id = user_id;

    RETURN json_build_object(
        'success', true,
        'reward', reward_amount,
        'streak', streak,
        'balance', current_balance
    );
END;
$$;
