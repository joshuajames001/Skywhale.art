-- GF-227: Atomic energy deduction to prevent TOCTOU race condition
-- Previous pattern: SELECT balance → CHECK >= cost → DEDUCT (3 separate ops)
-- New pattern: Single UPDATE with WHERE clause = atomic check+deduct

CREATE OR REPLACE FUNCTION deduct_energy_if_sufficient(p_user_id uuid, p_amount int)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_new_balance int;
BEGIN
  UPDATE public.profiles
  SET energy_balance = energy_balance - p_amount
  WHERE id = p_user_id AND energy_balance >= p_amount
  RETURNING energy_balance INTO v_new_balance;

  IF FOUND THEN
    RETURN json_build_object('success', true, 'new_balance', v_new_balance);
  ELSE
    RETURN json_build_object('success', false, 'new_balance',
      (SELECT energy_balance FROM public.profiles WHERE id = p_user_id));
  END IF;
END;
$$;
