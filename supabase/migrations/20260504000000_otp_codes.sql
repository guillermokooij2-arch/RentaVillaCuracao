-- OTP verification codes for booking form email verification
create table if not exists otp_codes (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null,
  code                text not null,
  used                boolean not null default false,
  expires_at          timestamptz not null,
  verification_token  text,
  token_expires_at    timestamptz,
  created_at          timestamptz not null default now()
);

-- Index for fast lookups by email
create index if not exists otp_codes_email_idx on otp_codes (email);

-- Auto-delete expired codes after 1 hour to keep the table clean
create index if not exists otp_codes_expires_idx on otp_codes (expires_at);

-- Row Level Security: edge functions use service role key so no RLS policy needed,
-- but enable RLS to block any accidental anon/user access
alter table otp_codes enable row level security;
