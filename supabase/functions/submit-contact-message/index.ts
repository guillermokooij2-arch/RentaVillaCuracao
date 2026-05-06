import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  language?: string;
  sourceUrl?: string;
  website?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  let payload: ContactPayload;
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Invalid JSON payload");
  }

  if (payload.website) {
    return jsonResponse({ ok: true });
  }

  const name = cleanText(payload.name || "", 120);
  const email = cleanText(payload.email || "", 180).toLowerCase();
  const message = cleanText(payload.message || "", 2500);
  const language = payload.language === "en" ? "en" : "nl";

  if (!name || !email || !message) {
    return errorResponse("Missing required contact fields");
  }
  if (!EMAIL_RE.test(email)) {
    return errorResponse("Invalid email address");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ownerEmail = Deno.env.get("OWNER_EMAIL") || "rentavillacuracao@gmail.com";
  const fromEmail = Deno.env.get("FROM_EMAIL") || "RentaVillaCuracao <bookings@rentavillacuracao.com>";
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return errorResponse("Supabase environment is not configured", 500);
  }
  if (!resendApiKey) {
    return errorResponse("Email provider is not configured", 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: contact, error: contactError } = await supabase
    .from("contact_messages")
    .insert({
      guest_name: name,
      guest_email: email,
      message,
      language,
      source_url: cleanText(payload.sourceUrl || req.headers.get("referer") || "", 500) || null,
      user_agent: cleanText(req.headers.get("user-agent") || "", 500) || null,
    })
    .select("id")
    .single<{ id: string }>();

  if (contactError || !contact) {
    return errorResponse("Could not save contact message", 500, contactError?.message);
  }

  const subject = "Nieuw contactbericht via RentaVillaCuracao";
  const result = await sendEmail({
    apiKey: resendApiKey,
    from: fromEmail,
    to: ownerEmail,
    replyTo: email,
    subject,
    html: `
      <h2>Nieuw contactbericht</h2>
      <p><strong>Naam:</strong> ${escapeHtml(name)}</p>
      <p><strong>E-mail:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><strong>Bericht:</strong><br>${escapeHtml(message)}</p>
    `,
    idempotencyKey: `contact-${contact.id}-owner`,
  });

  await supabase.from("email_logs").insert({
    contact_message_id: contact.id,
    recipient_type: "owner",
    recipient_email: ownerEmail,
    subject,
    provider_message_id: result.id || null,
    status: result.ok ? "sent" : "failed",
    error: result.error || null,
  });

  if (!result.ok) {
    return errorResponse("Message saved, but email failed", 502, result.error);
  }

  const guestSubject = language === "en"
    ? "We received your message"
    : "We hebben uw bericht ontvangen";

  const guestResult = await sendEmail({
    apiKey: resendApiKey,
    from: fromEmail,
    to: email,
    replyTo: ownerEmail,
    subject: guestSubject,
    html: renderGuestEmail({ name, language }),
    idempotencyKey: `contact-${contact.id}-guest`,
  });

  await supabase.from("email_logs").insert({
    contact_message_id: contact.id,
    recipient_type: "guest",
    recipient_email: email,
    subject: guestSubject,
    provider_message_id: guestResult.id || null,
    status: guestResult.ok ? "sent" : "failed",
    error: guestResult.error || null,
  });

  return jsonResponse({ ok: true, contactMessageId: contact.id, guestEmailSent: guestResult.ok });
});

function cleanText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
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

function renderGuestEmail(input: { name: string; language: string }): string {
  if (input.language === "en") {
    return `
      <h2>Thank you, ${escapeHtml(input.name)}</h2>
      <p>We received your message and will get back to you as soon as possible.</p>
      <p>This is a confirmation that your message has been received. It is not yet a response.</p>
    `;
  }
  return `
    <h2>Bedankt, ${escapeHtml(input.name)}</h2>
    <p>We hebben uw bericht ontvangen en nemen zo snel mogelijk contact met u op.</p>
    <p>Dit is een bevestiging dat uw bericht is ontvangen. Het is nog geen antwoord.</p>
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
