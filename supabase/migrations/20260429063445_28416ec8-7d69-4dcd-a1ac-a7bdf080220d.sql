-- Remove tickets feature
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TYPE IF EXISTS public.ticket_status CASCADE;

-- Remove tickets-specific Slack routing column
ALTER TABLE public.workspace_settings DROP COLUMN IF EXISTS slack_channel_tickets;