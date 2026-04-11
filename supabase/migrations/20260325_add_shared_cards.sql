-- GF-134: Create shared_cards table for Card Studio sharing
CREATE TABLE public.shared_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pages jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.shared_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shared cards"
  ON public.shared_cards FOR SELECT USING (true);

CREATE POLICY "Users can insert own cards"
  ON public.shared_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
