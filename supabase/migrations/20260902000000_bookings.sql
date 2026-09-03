-- Booking status and type enums
create type public.booking_status as enum ('confirmed', 'pending', 'completed', 'cancelled', 'no_show');
create type public.booking_type   as enum ('discovery', 'strategy', 'onboarding', 'support', 'other');
create type public.booking_source as enum ('retell_ai', 'manual', 'website');

-- Bookings table
create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  caller_name     text not null,
  caller_phone    text,
  caller_email    text,
  booking_type    public.booking_type   not null default 'discovery',
  scheduled_at    timestamptz not null,
  duration_minutes integer not null default 30,
  status          public.booking_status not null default 'pending',
  notes           text,
  source          public.booking_source not null default 'manual',
  retell_call_id  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for common queries (upcoming bookings, today's bookings)
create index bookings_scheduled_at_idx on public.bookings (scheduled_at);
create index bookings_status_idx       on public.bookings (status);
create index bookings_retell_call_id   on public.bookings (retell_call_id) where retell_call_id is not null;

-- Auto-update updated_at
create or replace function public.bookings_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.bookings_set_updated_at();

-- RLS: admins can do everything, authenticated users can read their own (by email match)
alter table public.bookings enable row level security;

create policy "Admins full access" on public.bookings
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

create policy "Service role full access" on public.bookings
  for all
  using (auth.role() = 'service_role');
