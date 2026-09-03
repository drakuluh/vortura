-- =========================================================
-- Package updates feature
-- =========================================================

-- 1. Tables ------------------------------------------------

CREATE TABLE public.package_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  status_change public.package_status NULL,
  progress_change integer NULL CHECK (progress_change IS NULL OR (progress_change BETWEEN 0 AND 100)),
  edited_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_package_updates_package ON public.package_updates(package_id, created_at DESC);

CREATE TABLE public.package_update_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id uuid NOT NULL REFERENCES public.package_updates(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NULL,
  size_bytes integer NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_package_update_attachments_update ON public.package_update_attachments(update_id);

CREATE TABLE public.package_update_reads (
  update_id uuid NOT NULL REFERENCES public.package_updates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (update_id, user_id)
);

CREATE INDEX idx_package_update_reads_user ON public.package_update_reads(user_id);

-- 2. RLS ---------------------------------------------------

ALTER TABLE public.package_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_update_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_update_reads ENABLE ROW LEVEL SECURITY;

-- Helper: does this update belong to a package owned by the user?
CREATE OR REPLACE FUNCTION public.package_update_belongs_to_user(_user_id uuid, _update_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.package_updates pu
    JOIN public.packages p ON p.id = pu.package_id
    JOIN public.clients c ON c.id = p.client_id
    WHERE pu.id = _update_id AND c.user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.package_belongs_to_user(_user_id uuid, _package_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.packages p
    JOIN public.clients c ON c.id = p.client_id
    WHERE p.id = _package_id AND c.user_id = _user_id
  )
$$;

-- package_updates policies
CREATE POLICY "Admins manage package_updates"
  ON public.package_updates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients view own package_updates"
  ON public.package_updates FOR SELECT TO authenticated
  USING (public.package_belongs_to_user(auth.uid(), package_id));

-- package_update_attachments policies
CREATE POLICY "Admins manage package_update_attachments"
  ON public.package_update_attachments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients view own package_update_attachments"
  ON public.package_update_attachments FOR SELECT TO authenticated
  USING (public.package_update_belongs_to_user(auth.uid(), update_id));

-- package_update_reads policies (any authenticated user manages own reads)
CREATE POLICY "Users view own reads"
  ON public.package_update_reads FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own reads"
  ON public.package_update_reads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own reads"
  ON public.package_update_reads FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 3. Triggers ----------------------------------------------

CREATE TRIGGER trg_package_updates_updated_at
  BEFORE UPDATE ON public.package_updates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply status/progress changes from an update to the parent package
CREATE OR REPLACE FUNCTION public.apply_package_update_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status_change IS NOT NULL OR NEW.progress_change IS NOT NULL THEN
    UPDATE public.packages
    SET
      status = COALESCE(NEW.status_change, status),
      progress = COALESCE(NEW.progress_change, progress),
      updated_at = now()
    WHERE id = NEW.package_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_package_update_changes
  AFTER INSERT ON public.package_updates
  FOR EACH ROW EXECUTE FUNCTION public.apply_package_update_changes();

-- Mark edited_at when admin edits an update
CREATE OR REPLACE FUNCTION public.mark_package_update_edited()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title OR NEW.body IS DISTINCT FROM OLD.body THEN
    NEW.edited_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mark_package_update_edited
  BEFORE UPDATE ON public.package_updates
  FOR EACH ROW EXECUTE FUNCTION public.mark_package_update_edited();

-- 4. Realtime ----------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE public.package_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.package_update_attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.package_update_reads;

ALTER TABLE public.package_updates REPLICA IDENTITY FULL;
ALTER TABLE public.package_update_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.package_update_reads REPLICA IDENTITY FULL;

-- 5. Storage bucket ----------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('package-updates', 'package-updates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: admins manage everything in this bucket
CREATE POLICY "Admins manage package-updates objects"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'package-updates' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'package-updates' AND has_role(auth.uid(), 'admin'::app_role));

-- Clients can read files belonging to their packages.
-- Convention: file path is "<package_id>/<update_id>/<filename>"
CREATE POLICY "Clients read own package-updates objects"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'package-updates'
    AND public.package_belongs_to_user(
      auth.uid(),
      NULLIF(split_part(name, '/', 1), '')::uuid
    )
  );