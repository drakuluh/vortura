
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.client_status AS ENUM ('active', 'onboarding', 'paused', 'churned');
CREATE TYPE public.package_status AS ENUM ('active', 'in_progress', 'review', 'paused');
CREATE TYPE public.invoice_status AS ENUM ('paid', 'due', 'overdue', 'draft');
CREATE TYPE public.change_status AS ENUM ('new', 'in_review', 'scheduled', 'shipped', 'rejected');
CREATE TYPE public.ticket_status AS ENUM ('open', 'waiting', 'resolved');
CREATE TYPE public.priority_level AS ENUM ('low', 'med', 'high');
CREATE TYPE public.health_level AS ENUM ('healthy', 'watch', 'at_risk');

-- Extend app_role with 'support'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support';

-- ============================================================
-- TABLES
-- ============================================================

-- clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  plan TEXT,
  status public.client_status NOT NULL DEFAULT 'onboarding',
  mrr_cents INTEGER NOT NULL DEFAULT 0,
  health public.health_level NOT NULL DEFAULT 'healthy',
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);

-- packages
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status public.package_status NOT NULL DEFAULT 'in_progress',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  engineer TEXT,
  due_date DATE,
  accent TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_packages_client_id ON public.packages(client_id);

-- invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  number TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
  due_at DATE,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- message_threads
CREATE TABLE public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_threads_client_id ON public.message_threads(client_id);
CREATE INDEX idx_threads_last_message ON public.message_threads(last_message_at DESC);

-- messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_side TEXT NOT NULL CHECK (sender_side IN ('admin', 'client')),
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- change_requests
CREATE TABLE public.change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority public.priority_level NOT NULL DEFAULT 'med',
  status public.change_status NOT NULL DEFAULT 'new',
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_change_requests_client_id ON public.change_requests(client_id);
CREATE INDEX idx_change_requests_status ON public.change_requests(status);

-- tickets
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  status public.ticket_status NOT NULL DEFAULT 'open',
  priority public.priority_level NOT NULL DEFAULT 'med',
  assignee_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tickets_client_id ON public.tickets(client_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);

-- workspace_settings (single-row)
CREATE TABLE public.workspace_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_name TEXT NOT NULL DEFAULT 'Vortura',
  support_email TEXT,
  slack_webhook TEXT,
  notify_new_ticket BOOLEAN NOT NULL DEFAULT true,
  notify_overdue_invoice BOOLEAN NOT NULL DEFAULT true,
  daily_digest BOOLEAN NOT NULL DEFAULT false,
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- activity_log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_client_owner(_user_id UUID, _client_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = _client_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.thread_belongs_to_user(_user_id UUID, _thread_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.message_threads t
    JOIN public.clients c ON c.id = t.client_id
    WHERE t.id = _thread_id AND c.user_id = _user_id
  )
$$;

-- ============================================================
-- updated_at triggers (reuse existing update_updated_at_column)
-- ============================================================
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_packages_updated BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_threads_updated BEFORE UPDATE ON public.message_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_messages_updated BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_change_requests_updated BEFORE UPDATE ON public.change_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tickets_updated BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workspace_settings_updated BEFORE UPDATE ON public.workspace_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bump thread last_message_at when a new message is inserted
CREATE OR REPLACE FUNCTION public.bump_thread_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.message_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_messages_bump_thread AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_thread_last_message();

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES
-- ============================================================

-- clients
CREATE POLICY "Admins manage clients" ON public.clients
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own client row" ON public.clients
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- packages
CREATE POLICY "Admins manage packages" ON public.packages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own packages" ON public.packages
  FOR SELECT TO authenticated
  USING (public.is_client_owner(auth.uid(), client_id));

-- invoices
CREATE POLICY "Admins manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (public.is_client_owner(auth.uid(), client_id));

-- message_threads
CREATE POLICY "Admins manage threads" ON public.message_threads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own threads" ON public.message_threads
  FOR SELECT TO authenticated
  USING (public.is_client_owner(auth.uid(), client_id));
CREATE POLICY "Clients create threads for self" ON public.message_threads
  FOR INSERT TO authenticated
  WITH CHECK (public.is_client_owner(auth.uid(), client_id));

-- messages
CREATE POLICY "Admins manage messages" ON public.messages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own messages" ON public.messages
  FOR SELECT TO authenticated
  USING (public.thread_belongs_to_user(auth.uid(), thread_id));
CREATE POLICY "Clients send messages on own threads" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.thread_belongs_to_user(auth.uid(), thread_id)
    AND sender_user_id = auth.uid()
    AND sender_side = 'client'
  );

-- change_requests
CREATE POLICY "Admins manage change_requests" ON public.change_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own change_requests" ON public.change_requests
  FOR SELECT TO authenticated
  USING (public.is_client_owner(auth.uid(), client_id));
CREATE POLICY "Clients create own change_requests" ON public.change_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_client_owner(auth.uid(), client_id));

-- tickets
CREATE POLICY "Admins manage tickets" ON public.tickets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients view own tickets" ON public.tickets
  FOR SELECT TO authenticated
  USING (public.is_client_owner(auth.uid(), client_id));
CREATE POLICY "Clients create own tickets" ON public.tickets
  FOR INSERT TO authenticated
  WITH CHECK (public.is_client_owner(auth.uid(), client_id));

-- workspace_settings
CREATE POLICY "Admins manage settings" ON public.workspace_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated read settings" ON public.workspace_settings
  FOR SELECT TO authenticated
  USING (true);

-- activity_log
CREATE POLICY "Admins read activity" ON public.activity_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated write activity" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_user_id = auth.uid());

-- ============================================================
-- SEED workspace_settings
-- ============================================================
INSERT INTO public.workspace_settings (workspace_name, support_email)
VALUES ('Vortura', 'support@vortura.com')
ON CONFLICT DO NOTHING;

-- ============================================================
-- BOOTSTRAP ADMIN: sean.hutchinson2001@gmail.com
-- ============================================================

-- If the user already exists, promote now
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(u.email) = 'sean.hutchinson2001@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Auto-promote on future signup of that email
CREATE OR REPLACE FUNCTION public.auto_promote_bootstrap_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'sean.hutchinson2001@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_promote_bootstrap_admin ON auth.users;
CREATE TRIGGER trg_auto_promote_bootstrap_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_promote_bootstrap_admin();

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;
