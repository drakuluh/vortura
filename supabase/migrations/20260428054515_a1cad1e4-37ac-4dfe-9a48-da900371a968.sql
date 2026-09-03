-- Add new statuses to invoice_status enum if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'sent' AND enumtypid = 'public.invoice_status'::regtype) THEN
    ALTER TYPE public.invoice_status ADD VALUE 'sent';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'void' AND enumtypid = 'public.invoice_status'::regtype) THEN
    ALTER TYPE public.invoice_status ADD VALUE 'void';
  END IF;
END$$;

-- Add columns to invoices
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS stripe_invoice_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS hosted_url text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'usd',
  ADD COLUMN IF NOT EXISTS line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'sandbox',
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- Allow service role to manage invoices (for webhooks)
DROP POLICY IF EXISTS "Service role manages invoices" ON public.invoices;
CREATE POLICY "Service role manages invoices"
  ON public.invoices FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');