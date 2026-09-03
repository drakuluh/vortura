-- Migrate existing rows off the values we're removing
UPDATE public.change_requests SET status = 'in_review' WHERE status = 'scheduled';
UPDATE public.change_requests SET status = 'shipped' WHERE status = 'rejected';

-- Recreate the enum with only the desired values
ALTER TYPE public.change_status RENAME TO change_status_old;

CREATE TYPE public.change_status AS ENUM ('new', 'in_review', 'shipped');

ALTER TABLE public.change_requests
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.change_requests
  ALTER COLUMN status TYPE public.change_status
  USING status::text::public.change_status;

ALTER TABLE public.change_requests
  ALTER COLUMN status SET DEFAULT 'new'::public.change_status;

DROP TYPE public.change_status_old;