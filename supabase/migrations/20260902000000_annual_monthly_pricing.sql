-- Replaces the free/pro plan model with two paid plans (monthly / annual) plus a
-- Stripe-driven trial. `plan` becomes nullable: NULL means "no active plan" (never
-- subscribed, or a subscription that ended) instead of a permanent free tier.

ALTER TABLE public.subscriptions
  ADD COLUMN trial_end timestamptz,
  ALTER COLUMN plan DROP NOT NULL,
  ALTER COLUMN plan DROP DEFAULT;

-- Existing paying subscribers (formerly the single 10 EUR/month "pro" plan) move to
-- the new monthly plan, per product decision. Existing "free" rows had no real plan.
UPDATE public.subscriptions SET plan = 'monthly' WHERE plan = 'pro';
UPDATE public.subscriptions SET plan = NULL WHERE plan = 'free';
