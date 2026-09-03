CREATE OR REPLACE FUNCTION public.guard_client_package_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'::public.app_role) THEN
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

UPDATE public.packages
SET
  engineer = COALESCE(engineer, (ARRAY['Avery Patel','Jordan Kim','Riley Chen','Morgan Diaz','Casey Nguyen','Taylor Brooks','Sam Rivera','Alex Okafor','Sean Hutchinson'])[1 + floor(random() * 9)::int]),
  due_date = COALESCE(due_date, (created_at + INTERVAL '14 days')::date)
WHERE engineer IS NULL OR due_date IS NULL;