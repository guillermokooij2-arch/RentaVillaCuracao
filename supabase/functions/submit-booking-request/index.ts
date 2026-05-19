import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

type BookingPayload = {
  villaId?: string;
  villaSlug?: string;
  name?: string;
  email?: string;
  phone?: string;
  checkin?: string;
  checkout?: string;
  guests?: string;
  message?: string;
  estimatedTotal?: number;
  language?: string;
  sourceUrl?: string;
  website?: string;
  otpToken?: string;
};

type PropertyRow = {
  id: string;
  slug: string;
  name: string;
  base_price_eur: number;
  cleaning_fee_eur: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  let payload: BookingPayload;
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Invalid JSON payload");
  }

  if (payload.website) {
    return jsonResponse({ ok: true });
  }

  const villaSlug = cleanText(payload.villaSlug || payload.villaId || "", 80);
  const name = cleanText(payload.name || "", 120);
  const email = cleanText(payload.email || "", 180).toLowerCase();
  const phone = cleanText(payload.phone || "", 80);
  const checkin = cleanText(payload.checkin || "", 10);
  const checkout = cleanText(payload.checkout || "", 10);
  const guests = cleanText(payload.guests || "", 30);
  const message = cleanText(payload.message || "", 2000);
  const language = payload.language === "en" ? "en" : "nl";

  const otpToken = cleanText(payload.otpToken || "", 40);

  if (!villaSlug || !name || !email || !checkin || !checkout || !guests) {
    return errorResponse("Missing required booking fields");
  }
  if (!EMAIL_RE.test(email)) {
    return errorResponse("Invalid email address");
  }
  if (!DATE_RE.test(checkin) || !DATE_RE.test(checkout) || checkout <= checkin) {
    return errorResponse("Invalid travel dates");
  }
  if (!otpToken) {
    return errorResponse("Email verification required", 403);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ownerEmail = Deno.env.get("OWNER_EMAIL");
  const fromEmail = Deno.env.get("FROM_EMAIL") || "RentaVillaCuracao <bookings@rentavillacuracao.com>";
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl || !serviceRoleKey || !ownerEmail) {
    return errorResponse("Supabase environment is not configured", 500);
  }
  if (!resendApiKey) {
    return errorResponse("Email provider is not configured", 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Verify OTP token belongs to this email and is still valid
  const { data: otpRow, error: otpError } = await supabase
    .from("otp_codes")
    .select("id")
    .eq("email", email)
    .eq("verification_token", otpToken)
    .eq("used", true)
    .gte("token_expires_at", new Date().toISOString())
    .limit(1)
    .single<{ id: string }>();

  if (otpError || !otpRow) {
    return errorResponse("Email verification expired or invalid. Please verify again.", 403);
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, slug, name, base_price_eur, cleaning_fee_eur")
    .eq("slug", villaSlug)
    .eq("active", true)
    .single<PropertyRow>();

  if (propertyError || !property) {
    return errorResponse("Villa not found", 404);
  }

  const { data: overlaps, error: overlapError } = await supabase
    .from("availability_blocks")
    .select("id, start_date, end_date")
    .eq("property_id", property.id)
    .lt("start_date", checkout)
    .gt("end_date", checkin)
    .limit(1);

  if (overlapError) {
    return errorResponse("Could not verify availability", 500, overlapError.message);
  }

  if (overlaps && overlaps.length > 0) {
    return errorResponse("Selected dates are no longer available", 409);
  }

  const nights = diffDays(checkin, checkout);
  const estimatedTotal = Number.isFinite(payload.estimatedTotal)
    ? Number(payload.estimatedTotal)
    : Number(property.base_price_eur) * nights + Number(property.cleaning_fee_eur);

  const { data: booking, error: bookingError } = await supabase
    .from("booking_requests")
    .insert({
      property_id: property.id,
      guest_name: name,
      guest_email: email,
      guest_phone: phone || null,
      checkin,
      checkout,
      guests,
      message: message || null,
      nights,
      estimated_total_eur: estimatedTotal,
      language,
      source_url: cleanText(payload.sourceUrl || req.headers.get("referer") || "", 500) || null,
      user_agent: cleanText(req.headers.get("user-agent") || "", 500) || null,
    })
    .select("id")
    .single<{ id: string }>();

  if (bookingError || !booking) {
    return errorResponse("Could not save booking request", 500, bookingError?.message);
  }

  const ownerSubject = `Nieuwe boekingsaanvraag: ${property.name}`;
  const guestSubject = language === "en"
    ? `We received your request for ${property.name}`
    : `We hebben uw aanvraag ontvangen voor ${property.name}`;

  const ownerBody = renderOwnerEmail({
    propertyName: property.name,
    name,
    email,
    phone,
    checkin,
    checkout,
    guests,
    nights,
    message,
    estimatedTotal,
  });
  const guestBody = renderGuestEmail({
    propertyName: property.name,
    name,
    checkin,
    checkout,
    guests,
    language,
  });

  const ownerResult = await sendEmail({
    apiKey: resendApiKey,
    from: fromEmail,
    to: ownerEmail,
    replyTo: email,
    subject: ownerSubject,
    html: ownerBody,
    idempotencyKey: `booking-${booking.id}-owner`,
  });

  await logEmail(supabase, {
    bookingRequestId: booking.id,
    recipientType: "owner",
    recipientEmail: ownerEmail,
    subject: ownerSubject,
    result: ownerResult,
  });

  const guestResult = await sendEmail({
    apiKey: resendApiKey,
    from: fromEmail,
    to: email,
    replyTo: ownerEmail,
    subject: guestSubject,
    html: guestBody,
    idempotencyKey: `booking-${booking.id}-guest`,
  });

  await logEmail(supabase, {
    bookingRequestId: booking.id,
    recipientType: "guest",
    recipientEmail: email,
    subject: guestSubject,
    result: guestResult,
  });

  if (!ownerResult.ok) {
    return errorResponse("Booking saved, but owner email failed", 502, ownerResult.error);
  }

  return jsonResponse({
    ok: true,
    bookingRequestId: booking.id,
    guestEmailSent: guestResult.ok,
  });
});

function cleanText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function diffDays(start: string, end: string): number {
  const startMs = Date.parse(`${start}T00:00:00Z`);
  const endMs = Date.parse(`${end}T00:00:00Z`);
  return Math.round((endMs - startMs) / 86_400_000);
}

async function sendEmail(input: {
  apiKey: string;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  idempotencyKey: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      reply_to: input.replyTo,
      subject: input.subject,
      html: input.html,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: body?.message || `Resend error ${response.status}` };
  }
  return { ok: true, id: body?.id };
}

async function logEmail(
  supabase: ReturnType<typeof createClient>,
  input: {
    bookingRequestId: string;
    recipientType: string;
    recipientEmail: string;
    subject: string;
    result: { ok: boolean; id?: string; error?: string };
  },
) {
  await supabase.from("email_logs").insert({
    booking_request_id: input.bookingRequestId,
    recipient_type: input.recipientType,
    recipient_email: input.recipientEmail,
    subject: input.subject,
    provider_message_id: input.result.id || null,
    status: input.result.ok ? "sent" : "failed",
    error: input.result.error || null,
  });
}

function renderOwnerEmail(input: {
  propertyName: string;
  name: string;
  email: string;
  phone: string;
  checkin: string;
  checkout: string;
  guests: string;
  nights: number;
  message: string;
  estimatedTotal: number;
}) {
  return `
    <h2>Nieuwe boekingsaanvraag</h2>
    <p><strong>Villa:</strong> ${escapeHtml(input.propertyName)}</p>
    <p><strong>Periode:</strong> ${input.checkin} tot ${input.checkout} (${input.nights} nachten)</p>
    <p><strong>Gasten:</strong> ${escapeHtml(input.guests)}</p>
    <p><strong>Naam:</strong> ${escapeHtml(input.name)}</p>
    <p><strong>E-mail:</strong> <a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></p>
    <p><strong>Telefoon:</strong> ${escapeHtml(input.phone || "Niet opgegeven")}</p>
    <p><strong>Schatting:</strong> EUR ${input.estimatedTotal.toFixed(2)}</p>
    ${input.message ? `<p><strong>Bericht:</strong><br>${escapeHtml(input.message)}</p>` : ""}
  `;
}

function renderGuestEmail(input: {
  propertyName: string;
  name: string;
  checkin: string;
  checkout: string;
  guests: string;
  language: string;
}) {
  if (input.language === "en") {
    return `
      <h2>Thank you, ${escapeHtml(input.name)}</h2>
      <p>We received your request for <strong>${escapeHtml(input.propertyName)}</strong>.</p>
      <p><strong>Dates:</strong> ${input.checkin} to ${input.checkout}<br>
      <strong>Guests:</strong> ${escapeHtml(input.guests)}</p>
      <p>Your hostess will check the latest availability and reply as soon as possible.</p>
      <p>This is a request confirmation, not a final booking confirmation yet.</p>
    `;
  }

  return `
    <h2>Bedankt, ${escapeHtml(input.name)}</h2>
    <p>We hebben uw aanvraag voor <strong>${escapeHtml(input.propertyName)}</strong> ontvangen.</p>
    <p><strong>Periode:</strong> ${input.checkin} tot ${input.checkout}<br>
    <strong>Gasten:</strong> ${escapeHtml(input.guests)}</p>
    <p>Uw gastvrouw controleert de actuele beschikbaarheid en reageert zo snel mogelijk.</p>
    <p>Dit is een ontvangstbevestiging, nog geen definitieve boekingsbevestiging.</p>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
