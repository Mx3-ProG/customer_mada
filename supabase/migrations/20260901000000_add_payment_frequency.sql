-- Adds a payment-frequency (monthly vs one-time) dimension to each client economics
-- amount, and the score-settings bonus applied when the sale price is paid monthly.

ALTER TABLE public.clients
  ADD COLUMN sale_price_frequency text NOT NULL DEFAULT 'one_time',
  ADD COLUMN cost_price_frequency text NOT NULL DEFAULT 'one_time',
  ADD COLUMN charges_frequency text NOT NULL DEFAULT 'one_time';

ALTER TABLE public.clients
  ADD CONSTRAINT clients_sale_price_frequency_check CHECK (sale_price_frequency IN ('monthly', 'one_time')),
  ADD CONSTRAINT clients_cost_price_frequency_check CHECK (cost_price_frequency IN ('monthly', 'one_time')),
  ADD CONSTRAINT clients_charges_frequency_check CHECK (charges_frequency IN ('monthly', 'one_time'));

ALTER TABLE public.score_settings
  ADD COLUMN monthly_payment_bonus numeric NOT NULL DEFAULT 5;
