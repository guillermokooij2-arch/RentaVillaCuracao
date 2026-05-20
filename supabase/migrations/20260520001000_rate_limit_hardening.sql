alter table public.booking_requests
  add column if not exists ip_hash text;

alter table public.otp_codes
  add column if not exists ip_hash text;

create index if not exists booking_requests_ip_hash_created_at_idx
  on public.booking_requests(ip_hash, created_at);

create index if not exists booking_requests_guest_email_created_at_idx
  on public.booking_requests(guest_email, created_at);

create index if not exists otp_codes_ip_hash_created_at_idx
  on public.otp_codes(ip_hash, created_at);
