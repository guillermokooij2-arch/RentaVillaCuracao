import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  let payload: { email?: string; language?: string; website?: string };
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Invalid JSON");
  }

  if (payload.website) return jsonResponse({ ok: true });

  const email = (payload.email || "").trim().toLowerCase();
  const language = payload.language === "en" ? "en" : "nl";

  if (!email || !EMAIL_RE.test(email)) return errorResponse("Invalid email address");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("FROM_EMAIL") || "RentaVillaCuracao <bookings@rentavillacuracao.com>";

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return errorResponse("Server not configured", 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  // Rate limit: max 3 OTPs per email per 10 minutes
  const windowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("otp_codes")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= 3) {
    return errorResponse(
      language === "en"
        ? "Too many attempts. Please wait 10 minutes before requesting a new code."
        : "Te veel pogingen. Wacht 10 minuten voor een nieuwe code.",
      429,
    );
  }

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase.from("otp_codes").insert({
    email,
    code,
    expires_at: expiresAt,
  });

  if (insertError) return errorResponse("Could not create verification code", 500);

  const subject = language === "en" ? "Your verification code" : "Uw verificatiecode";
  const html = language === "en"
    ? `<h2>Your verification code</h2><p>Use this code to confirm your booking request:</p><h1 style="letter-spacing:8px;font-size:36px;">${code}</h1><p>This code is valid for 15 minutes.</p>`
    : `<h2>Uw verificatiecode</h2><p>Gebruik deze code om uw boekingsaanvraag te bevestigen:</p><h1 style="letter-spacing:8px;font-size:36px;">${code}</h1><p>Deze code is 15 minuten geldig.</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromEmail, to: [email], subject, html }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return errorResponse("Could not send verification email", 502, body?.message);
  }

  return jsonResponse({ ok: true });
});
