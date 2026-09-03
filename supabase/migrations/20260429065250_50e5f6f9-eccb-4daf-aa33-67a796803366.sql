ALTER TABLE public.change_requests
  ADD COLUMN IF NOT EXISTS client_approved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS client_approved_by uuid;

-- Allow clients to update their own change requests, but only the approval columns
-- (RLS handles row visibility; column-level restriction enforced via trigger below)
DROP POLICY IF EXISTS "Clients update approval on own change_requests" ON public.change_requests;
CREATE POLICY "Clients update approval on own change_requests"
  ON public.change_requests
  FOR UPDATE
  TO authenticated
  USING (is_client_owner(auth.uid(), client_id))
  WITH CHECK (is_client_owner(auth.uid(), client_id));

-- Trigger to prevent clients from changing anything other than the approval columns
CREATE OR REPLACE FUNCTION public.guard_client_change_request_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins and service role bypass
  IF auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  -- Non-admin authenticated users (clients) may only modify approval fields
  IF NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.priority IS DISTINCT FROM OLD.priority
     OR NEW.package_id IS DISTINCT FROM OLD.package_id
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
     OR NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id THEN
    RAISE EXCEPTION 'Clients can only update approval fields on a change request';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_client_change_request_update ON public.change_requests;
CREATE TRIGGER guard_client_change_request_update
BEFORE UPDATE ON public.change_requests
FOR EACH ROW EXECUTE FUNCTION public.guard_client_change_request_update();