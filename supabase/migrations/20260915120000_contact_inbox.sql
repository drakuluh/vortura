-- Contact page, part 1 of the backend:
--   1. contact_submissions: messages from the public contact form (the form
--      previously simulated a send and stored nothing).
--   2. 'prospect' client status + ensure_my_client(): any signed-in user can
--      start a conversation with the team; their client row is created on
--      their first message.
--   3. bookings.user_id / ip_hash + booked_slots(): calls booked from the
--      website go through the book-call function, are linked to the account,
--      and the calendar can show real availability without exposing who
--      booked what.

-- ── 1. Contact form submissions ─────────────────────────────────────────────
create table public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  email      text not null check (char_length(email) between 3 and 255),
  company    text check (company is null or char_length(company) <= 120),
  message    text not null check (char_length(message) between 1 and 2000),
  status     text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  page_path  text,
  -- HMAC of the sender's IP, used only for rate limiting. Never the raw IP.
  ip_hash    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_submissions_created_idx on public.contact_submissions (created_at desc);
create index contact_submissions_status_idx  on public.contact_submissions (status);
create index contact_submissions_ip_idx      on public.contact_submissions (ip_hash, created_at desc);

create trigger trg_contact_submissions_updated
  before update on public.contact_submissions
  for each row execute function public.update_updated_at_column();

alter table public.contact_submissions enable row level security;

-- No insert policy on purpose: rows are written only by the submit-contact
-- edge function (service role), which validates and rate-limits first.
create policy "Admins manage contact submissions" on public.contact_submissions
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ── 2. Self-serve client records ────────────────────────────────────────────
-- Someone who signed up and messaged us but hasn't bought anything yet.
alter type public.client_status add value if not exists 'prospect';

create or replace function public.ensure_my_client()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_id      uuid;
  v_email   text;
  v_profile public.profiles%rowtype;
  v_person  text;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  -- Serialize per user so two quick first messages can't create two rows.
  perform pg_advisory_xact_lock(hashtext('ensure_my_client:' || v_uid::text));

  select id into v_id from public.clients where user_id = v_uid order by created_at limit 1;
  if v_id is not null then
    return jsonb_build_object('client_id', v_id, 'created', false);
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  select email into v_email from auth.users where id = v_uid;
  v_person := coalesce(
    nullif(btrim(concat_ws(' ', v_profile.first_name, v_profile.last_name)), ''),
    nullif(btrim(v_profile.display_name), '')
  );

  insert into public.clients (user_id, name, contact_name, email, status, notes)
  values (
    v_uid,
    coalesce(nullif(btrim(v_profile.business_name), ''), v_person, v_email, 'New contact'),
    v_person,
    v_email,
    'prospect',
    'Created automatically when they first messaged the team from the website.'
  )
  returning id into v_id;

  return jsonb_build_object('client_id', v_id, 'created', true);
end;
$$;

revoke all on function public.ensure_my_client() from public, anon;
grant execute on function public.ensure_my_client() to authenticated;

-- ── 3. Bookings from the website ────────────────────────────────────────────
alter table public.bookings
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists ip_hash text;

create index if not exists bookings_user_id_idx on public.bookings (user_id);
create index if not exists bookings_ip_hash_idx on public.bookings (ip_hash, created_at desc) where ip_hash is not null;

create policy "Users view own bookings" on public.bookings
  for select to authenticated
  using (user_id = auth.uid());

-- Start/end of every active booking in a range, and nothing else, so the
-- public calendar can grey out taken times. Range capped at 62 days.
create or replace function public.booked_slots(range_start timestamptz, range_end timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select b.scheduled_at, b.scheduled_at + make_interval(mins => b.duration_minutes)
  from public.bookings b
  where b.status in ('pending', 'confirmed')
    and b.scheduled_at < least(range_end, range_start + interval '62 days')
    and b.scheduled_at + make_interval(mins => b.duration_minutes) > range_start
  order by b.scheduled_at;
$$;

grant execute on function public.booked_slots(timestamptz, timestamptz) to anon, authenticated;
