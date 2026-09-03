-- Replace the sync trigger function so it upserts (creates the clients row if missing).
CREATE OR REPLACE FUNCTION public.sync_client_name_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  derived text;
  v_email text;
  existing_id uuid;
BEGIN
  derived := public.derive_customer_name(NEW);

  SELECT id INTO existing_id FROM public.clients WHERE user_id = NEW.id LIMIT 1;

  IF existing_id IS NOT NULL THEN
    UPDATE public.clients
      SET name = derived,
          updated_at = now()
      WHERE id = existing_id;
  ELSE
    -- Pull email from auth.users for the new client row.
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;

    INSERT INTO public.clients (user_id, name, email, contact_name)
    VALUES (
      NEW.id,
      derived,
      v_email,
      NULLIF(btrim(concat_ws(' ', NULLIF(btrim(NEW.first_name), ''), NULLIF(btrim(NEW.last_name), ''))), '')
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill: create a clients row for every profile that doesn't have one,
-- and refresh the name on existing rows so business accounts show the business name.
INSERT INTO public.clients (user_id, name, email, contact_name)
SELECT
  p.id,
  public.derive_customer_name(p.*),
  u.email,
  NULLIF(btrim(concat_ws(' ', NULLIF(btrim(p.first_name), ''), NULLIF(btrim(p.last_name), ''))), '')
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
LEFT JOIN public.clients c ON c.user_id = p.id
WHERE c.id IS NULL;

UPDATE public.clients c
SET name = public.derive_customer_name(p.*),
    updated_at = now()
FROM public.profiles p
WHERE c.user_id = p.id
  AND c.name IS DISTINCT FROM public.derive_customer_name(p.*);
