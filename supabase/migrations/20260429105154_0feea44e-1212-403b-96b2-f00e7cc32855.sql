CREATE POLICY "Clients update own package nickname"
ON public.packages
FOR UPDATE
TO authenticated
USING (is_client_owner(auth.uid(), client_id))
WITH CHECK (is_client_owner(auth.uid(), client_id));

CREATE OR REPLACE FUNCTION public.guard_client_package_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.name IS DISTINCT FROM OLD.name
     OR NEW.tier IS DISTINCT FROM OLD.tier
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.progress IS DISTINCT FROM OLD.progress
     OR NEW.engineer IS DISTINCT FROM OLD.engineer
     OR NEW.due_date IS DISTINCT FROM OLD.due_date
     OR NEW.accent IS DISTINCT FROM OLD.accent THEN
    RAISE EXCEPTION 'Clients can only update the nickname on a package';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_client_package_update_trg ON public.packages;
CREATE TRIGGER guard_client_package_update_trg
BEFORE UPDATE ON public.packages
FOR EACH ROW EXECUTE FUNCTION public.guard_client_package_update();