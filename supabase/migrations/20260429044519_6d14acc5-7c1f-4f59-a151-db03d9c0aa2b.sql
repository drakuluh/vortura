-- Comments thread for each change request
CREATE TABLE public.change_request_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  change_request_id uuid NOT NULL REFERENCES public.change_requests(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL,
  author_side text NOT NULL CHECK (author_side IN ('client', 'admin')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_change_request_comments_request ON public.change_request_comments(change_request_id, created_at);

ALTER TABLE public.change_request_comments ENABLE ROW LEVEL SECURITY;

-- Helper: does this change request belong to this user?
CREATE OR REPLACE FUNCTION public.change_request_belongs_to_user(_user_id uuid, _change_request_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.change_requests cr
    JOIN public.clients c ON c.id = cr.client_id
    WHERE cr.id = _change_request_id AND c.user_id = _user_id
  )
$$;

-- Admins manage all
CREATE POLICY "Admins manage change_request_comments"
  ON public.change_request_comments
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Clients view comments on their own change requests
CREATE POLICY "Clients view comments on own change_requests"
  ON public.change_request_comments
  FOR SELECT
  TO authenticated
  USING (change_request_belongs_to_user(auth.uid(), change_request_id));

-- Clients post comments on their own change requests (must be themselves & client side)
CREATE POLICY "Clients post comments on own change_requests"
  ON public.change_request_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    change_request_belongs_to_user(auth.uid(), change_request_id)
    AND author_user_id = auth.uid()
    AND author_side = 'client'
  );

CREATE TRIGGER trg_change_request_comments_updated_at
  BEFORE UPDATE ON public.change_request_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();