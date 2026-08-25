ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS real_need text,
  ADD COLUMN IF NOT EXISTS business_since date,
  ADD COLUMN IF NOT EXISTS siret text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS headquarters text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS google_business text,
  ADD COLUMN IF NOT EXISTS social_links text;

CREATE TABLE public.score_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE,
  interaction_grace_days integer NOT NULL DEFAULT 14,
  interaction_days_per_point numeric NOT NULL DEFAULT 3,
  interaction_max_penalty integer NOT NULL DEFAULT 35,
  interaction_missing_penalty integer NOT NULL DEFAULT 25,
  overdue_points_per_day numeric NOT NULL DEFAULT 2,
  overdue_max_penalty integer NOT NULL DEFAULT 40,
  no_payment_penalty integer NOT NULL DEFAULT 15,
  no_payment_after_days integer NOT NULL DEFAULT 30,
  margin_good_rate numeric NOT NULL DEFAULT 0.4,
  margin_ok_rate numeric NOT NULL DEFAULT 0.2,
  margin_ok_penalty integer NOT NULL DEFAULT 5,
  margin_low_penalty integer NOT NULL DEFAULT 15,
  margin_negative_penalty integer NOT NULL DEFAULT 30,
  no_price_penalty integer NOT NULL DEFAULT 10,
  loyalty_days integer NOT NULL DEFAULT 365,
  loyalty_bonus integer NOT NULL DEFAULT 5,
  risk_threshold integer NOT NULL DEFAULT 55,
  alarm_threshold integer NOT NULL DEFAULT 40,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.score_settings TO authenticated;
GRANT ALL ON public.score_settings TO service_role;

ALTER TABLE public.score_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own score settings" ON public.score_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own score settings" ON public.score_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own score settings" ON public.score_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own score settings" ON public.score_settings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_score_settings_updated_at
  BEFORE UPDATE ON public.score_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();