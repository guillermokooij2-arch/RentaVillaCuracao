alter table public.contact_messages
  add column if not exists ip_hash text;

create index if not exists contact_messages_ip_hash_created_at_idx
  on public.contact_messages(ip_hash, created_at);
