CREATE POLICY "Clients mark admin messages read on own threads"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  thread_belongs_to_user(auth.uid(), thread_id)
  AND sender_side = 'admin'
)
WITH CHECK (
  thread_belongs_to_user(auth.uid(), thread_id)
  AND sender_side = 'admin'
);