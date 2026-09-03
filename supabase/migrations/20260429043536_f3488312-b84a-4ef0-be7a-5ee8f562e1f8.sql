ALTER TABLE public.workspace_settings
  DROP COLUMN IF EXISTS notify_new_ticket,
  DROP COLUMN IF EXISTS notify_overdue_invoice,
  DROP COLUMN IF EXISTS daily_digest;