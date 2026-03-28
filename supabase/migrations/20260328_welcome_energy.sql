-- Grant 160 Energy (= 1 free 3-page story) to every new user on signup.
-- Modifies existing handle_new_user trigger to add welcome energy after profile creation.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code text;
  v_referrer_id uuid;
  v_welcome_energy int := 160; -- STORY_COSTS[3] = (3+1) * 40 = 160 Energy
BEGIN
  -- Safe Referral Lookup
  BEGIN
      v_referral_code := new.raw_user_meta_data->>'referral_code';
      IF v_referral_code IS NOT NULL THEN
         SELECT id INTO v_referrer_id FROM public.profiles WHERE referral_code = v_referral_code LIMIT 1;
      END IF;
  EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Referral Lookup Failed: %', SQLERRM;
      v_referrer_id := NULL;
  END;

  -- Safe Profile Insert
  BEGIN
      INSERT INTO public.profiles (id, email, referred_by)
      VALUES (new.id, new.email, v_referrer_id)
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Profile Creation Failed for %: %', new.id, SQLERRM;
  END;

  -- Welcome Energy Grant (160 = 1 free 3-page story)
  BEGIN
      PERFORM add_energy(new.id, v_welcome_energy);

      INSERT INTO transactions (user_id, amount_czk, energy_amount, package_id, status)
      VALUES (new.id, 0, v_welcome_energy, 'welcome_bonus', 'completed');
  EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Welcome Energy Grant Failed for %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
