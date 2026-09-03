ALTER TABLE public.workspace_settings
  ADD COLUMN IF NOT EXISTS slack_channel_default text,
  ADD COLUMN IF NOT EXISTS slack_channel_tickets text,
  ADD COLUMN IF NOT EXISTS slack_channel_clients text,
  ADD COLUMN IF NOT EXISTS slack_channel_messages text,
  ADD COLUMN IF NOT EXISTS slack_channel_change_requests text,
  ADD COLUMN IF NOT EXISTS slack_channel_invoices text,
  ADD COLUMN IF NOT EXISTS slack_channel_payments text;