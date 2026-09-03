-- 1. Account type enum
DO $$ BEGIN
  CREATE TYPE public.account_type AS ENUM ('individual', 'business');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type public.account_type NOT NULL DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- 3. Derive customer display name from a profile row
CREATE OR REPLACE FUNCTION public.derive_customer_name(_profile public.profiles)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _profile.account_type = 'business'
      AND _profile.business_name IS NOT NULL
      AND length(btrim(_profile.business_name)) > 0
        THEN btrim(_profile.business_name)
    WHEN COALESCE(length(btrim(_profile.first_name)), 0) > 0
      OR COALESCE(length(btrim(_profile.last_name)), 0) > 0
        THEN btrim(concat_ws(' ', NULLIF(btrim(_profile.first_name), ''), NULLIF(btrim(_profile.last_name), '')))
    WHEN _profile.display_name IS NOT NULL AND length(btrim(_profile.display_name)) > 0
        THEN btrim(_profile.display_name)
    ELSE 'Customer'
  END
$$;

-- 4. Trigger: keep clients.name in sync with profile changes
CREATE OR REPLACE FUNCTION public.sync_client_name_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  derived text;
BEGIN
  derived := public.derive_customer_name(NEW);
  UPDATE public.clients
    SET name = derived,
        updated_at = now()
    WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_client_name_from_profile_trg ON public.profiles;
CREATE TRIGGER sync_client_name_from_profile_trg
AFTER INSERT OR UPDATE OF first_name, last_name, business_name, account_type, display_name
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_client_name_from_profile();

-- 5. Update handle_new_user to capture extra signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_first text := NULLIF(btrim(meta ->> 'first_name'), '');
  v_last text := NULLIF(btrim(meta ->> 'last_name'), '');
  v_business text := NULLIF(btrim(meta ->> 'business_name'), '');
  v_account_type public.account_type;
  v_onboarded boolean;
  v_display text;
BEGIN
  v_account_type := CASE
    WHEN lower(COALESCE(meta ->> 'account_type', '')) = 'business' THEN 'business'::public.account_type
    ELSE 'individual'::public.account_type
  END;

  -- Email/password signups send account_type explicitly => onboarded.
  -- OAuth (Google) signups won't => force onboarding.
  v_onboarded := (meta ? 'account_type');

  v_display := COALESCE(
    meta ->> 'display_name',
    meta ->> 'full_name',
    NULLIF(btrim(concat_ws(' ', v_first, v_last)), ''),
    NEW.email
  );

  INSERT INTO public.profiles (id, display_name, avatar_url, first_name, last_name, business_name, account_type, onboarding_completed)
  VALUES (
    NEW.id,
    v_display,
    meta ->> 'avatar_url',
    v_first,
    v_last,
    CASE WHEN v_account_type = 'business' THEN v_business ELSE NULL END,
    v_account_type,
    v_onboarded
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- 6. Backfill: anyone with a non-empty business_name => business; else individual.
-- Force everyone to re-confirm via onboarding on next login.
UPDATE public.profiles
SET account_type = CASE
      WHEN business_name IS NOT NULL AND length(btrim(business_name)) > 0
        THEN 'business'::public.account_type
      ELSE 'individual'::public.account_type
    END,
    onboarding_completed = false;
