# RentaVillaCuracao Backend Setup

This project now has a Supabase + Resend backend foundation for booking requests, contact emails, and availability sync.

Important: rotate the Resend API key that was pasted into chat. Add the new key as a Supabase secret. Do not commit it to this repo.

## What Was Added

- `supabase/migrations/20260502000000_booking_backend.sql`
  - `properties`
  - `calendar_sources`
  - `availability_blocks`
  - `booking_requests`
  - `contact_messages`
  - `email_logs`

- `supabase/functions/submit-booking-request`
  - Validates booking requests.
  - Checks blocked dates again server-side.
  - Saves the request.
  - Sends owner and guest emails through Resend.
  - Logs email delivery.

- `supabase/functions/submit-contact-message`
  - Saves general contact messages.
  - Emails the owner.
  - Logs delivery.

- `supabase/functions/get-availability`
  - Returns blocked dates for the frontend calendar.

- `supabase/functions/sync-calendars`
  - Imports iCal feeds into `availability_blocks`.

## Public Frontend Config

The frontend uses this public Supabase Functions URL in `js/main.js`:

```js
supabaseFunctionsUrl: 'https://slscbdrmhzhopvpvcome.supabase.co/functions/v1'
```

This is safe to expose. Private keys are only used inside Supabase Edge Functions.

## Secrets To Add In Supabase

In Supabase Dashboard:

Project Settings -> Edge Functions -> Secrets

Add:

```txt
RESEND_API_KEY=your_rotated_resend_key
OWNER_EMAIL=rentavillacuracao@gmail.com
FROM_EMAIL=RentaVillaCuracao <bookings@yourdomain.com>
SYNC_SECRET=choose-a-long-random-string
```

Supabase usually provides `SUPABASE_URL` automatically. Add `SUPABASE_SERVICE_ROLE_KEY` as a secret if your function environment does not already have it.

Do not put these in `index.html`, `js/main.js`, or any committed file.

## Deploy Steps

From this project folder:

```bash
supabase login
supabase link --project-ref slscbdrmhzhopvpvcome
supabase db push
supabase functions deploy submit-booking-request
supabase functions deploy submit-contact-message
supabase functions deploy get-availability
supabase functions deploy sync-calendars
supabase functions deploy send-otp
supabase functions deploy verify-otp
```

Then set secrets:

```bash
supabase secrets set RESEND_API_KEY=your_rotated_resend_key
supabase secrets set OWNER_EMAIL=rentavillacuracao@gmail.com
supabase secrets set "FROM_EMAIL=RentaVillaCuracao <bookings@yourdomain.com>"
supabase secrets set SYNC_SECRET=choose-a-long-random-string
```

## Add Villa iCal Feeds

Insert one or more feeds per villa:

```sql
insert into public.calendar_sources (property_id, source_name, ical_url)
select id, 'Airbnb', 'https://example.com/calendar.ics'
from public.properties
where slug = 'villa-abdo';
```

Repeat for Booking.com, Airbnb, Google Calendar, or other iCal sources.

Current villa slugs:

```txt
casa-dushi-dolores
casa-prikichi
villa-c7
villa-dushi-bida
villa-abdo
kas-granjero
veranosol
```

## Manual Sync Test

After adding at least one real iCal feed:

```bash
curl -X POST "https://slscbdrmhzhopvpvcome.supabase.co/functions/v1/sync-calendars" \
  -H "x-sync-secret: your-sync-secret"
```

Then test availability:

```bash
curl "https://slscbdrmhzhopvpvcome.supabase.co/functions/v1/get-availability?villa=villa-abdo"
```

## Booking Request Test

```bash
curl -X POST "https://slscbdrmhzhopvpvcome.supabase.co/functions/v1/submit-booking-request" \
  -H "Content-Type: application/json" \
  -d '{
    "villaSlug": "villa-abdo",
    "name": "Test Guest",
    "email": "guest@example.com",
    "phone": "+31612345678",
    "checkin": "2026-07-01",
    "checkout": "2026-07-08",
    "guests": "2",
    "message": "Test request",
    "language": "en"
  }'
```

## Production Notes

- Treat site bookings as requests, not instant confirmed bookings.
- iCal can lag, so the backend re-check is helpful but not a full channel-manager replacement.
- Resend sender domain should be verified with SPF, DKIM, and DMARC for better delivery.
- Later, add an admin dashboard for request status, manual blocked dates, and email history.
