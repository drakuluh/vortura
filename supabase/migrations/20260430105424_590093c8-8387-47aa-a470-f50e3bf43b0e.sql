-- Add custom package support
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS custom_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false;

-- Auto-assign a CUS-XXXX hex ID to packages flagged as custom
CREATE OR REPLACE FUNCTION public.assign_package_custom_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  candidate text;
  attempts int := 0;
BEGIN
  IF NEW.is_custom IS TRUE AND (NEW.custom_id IS NULL OR length(btrim(NEW.custom_id)) = 0) THEN
    LOOP
      candidate := 'CUS-' || upper(substr(encode(gen_random_bytes(2), 'hex'), 1, 4));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.packages WHERE custom_id = candidate);
      attempts := attempts + 1;
      IF attempts > 10 THEN
        candidate := 'CUS-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
        EXIT;
      END IF;
    END LOOP;
    NEW.custom_id := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_package_custom_id ON public.packages;
CREATE TRIGGER trg_assign_package_custom_id
  BEFORE INSERT ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_package_custom_id();

-- Link invoices to a specific package (for custom-package invoicing flow)
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS package_id uuid;

-- Track linked Stripe subscription on the invoice row when a recurring component was created
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;