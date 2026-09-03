DO $$ BEGIN
  CREATE TYPE public.invoice_type AS ENUM ('one_time', 'recurring');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS invoice_type public.invoice_type NOT NULL DEFAULT 'one_time';

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_type ON public.invoices(invoice_type);