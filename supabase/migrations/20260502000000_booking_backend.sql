create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  location text,
  base_price_eur numeric(10,2) not null default 145,
  cleaning_fee_eur numeric(10,2) not null default 100,
  max_guests integer not null default 6,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_sources (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  source_name text not null,
  source_type text not null default 'ical',
  ical_url text not null,
  active boolean not null default true,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  calendar_source_id uuid references public.calendar_sources(id) on delete set null,
  source text not null default 'manual',
  source_event_key text not null unique,
  external_event_id text,
  start_date date not null,
  end_date date not null,
  summary text,
  status text not null default 'blocked',
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint availability_blocks_valid_dates check (end_date > start_date)
);

create index if not exists availability_blocks_property_dates_idx
  on public.availability_blocks(property_id, start_date, end_date);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id),
  status text not null default 'new',
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  checkin date not null,
  checkout date not null,
  guests text not null,
  message text,
  nights integer not null,
  estimated_total_eur numeric(10,2),
  language text not null default 'nl',
  source_url text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_requests_valid_dates check (checkout > checkin),
  constraint booking_requests_status_check check (status in ('new', 'contacted', 'confirmed', 'declined', 'cancelled'))
);

create index if not exists booking_requests_property_dates_idx
  on public.booking_requests(property_id, checkin, checkout);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_email text not null,
  message text not null,
  language text not null default 'nl',
  source_url text,
  user_agent text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_messages_status_check check (status in ('new', 'replied', 'archived'))
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid references public.booking_requests(id) on delete set null,
  contact_message_id uuid references public.contact_messages(id) on delete set null,
  recipient_type text not null,
  recipient_email text not null,
  subject text not null,
  provider text not null default 'resend',
  provider_message_id text,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;
alter table public.calendar_sources enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.booking_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.email_logs enable row level security;

insert into public.properties (slug, name, location, base_price_eur, cleaning_fee_eur, max_guests)
values
  ('casa-dushi-dolores', 'Casa Dushi Dolores', 'Jan Thiel, Marbella Estate', 145, 150, 6),
  ('casa-prikichi', 'Casa Prikichi', 'Jan Thiel, Marbella Estate', 145, 150, 8),
  ('villa-c7', 'Villa Dushi', 'Jan Thiel, Marbella Estate', 145, 150, 6),
  ('villa-dushi-bida', 'Villa Dushi Bida', 'Jan Thiel, Marbella Estate', 145, 150, 6),
  ('villa-abdo', 'Villa Abdo', 'Jan Thiel, Marbella Estate', 145, 150, 6),
  ('kas-granjero', 'Kas Granjero', 'Jan Thiel, Marbella Estate', 145, 150, 6),
  ('veranosol', 'Veranosol', 'Jan Thiel, Marbella Estate', 145, 150, 6)
on conflict (slug) do update set
  name = excluded.name,
  location = excluded.location,
  base_price_eur = excluded.base_price_eur,
  cleaning_fee_eur = excluded.cleaning_fee_eur,
  max_guests = excluded.max_guests,
  updated_at = now();
