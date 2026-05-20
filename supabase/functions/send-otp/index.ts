import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  let payload: { email?: string; language?: string; website?: string; purpose?: string };
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Invalid JSON");
  }

  if (payload.website) return jsonResponse({ ok: true });

  const email = (payload.email || "").trim().toLowerCase();
  const language = payload.language === "en" ? "en" : "nl";
  const purpose = payload.purpose === "contact" ? "contact" : "booking";

  if (!email || !EMAIL_RE.test(email)) return errorResponse("Invalid email address");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("FROM_EMAIL") || "RentaVillaCuracao <bookings@rentavillacuracao.com>";
  const ipHashSalt = Deno.env.get("IP_HASH_SALT") || serviceRoleKey || "";

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return errorResponse("Server not configured", 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const ipHash = await hashIpAddress(getClientIp(req), ipHashSalt);

  // Rate limit: max 3 OTPs per email per 10 minutes
  const windowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count, error: emailRateError } = await supabase
    .from("otp_codes")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", windowStart);

  if (emailRateError) return errorResponse("Could not verify request limit", 500, emailRateError.message);
  if ((count ?? 0) >= 3) {
    return errorResponse(
      language === "en"
        ? "Too many attempts. Please wait 10 minutes before requesting a new code."
        : "Te veel pogingen. Wacht 10 minuten voor een nieuwe code.",
      429,
    );
  }

  // Rate limit: max 8 OTPs per IP per hour, even across different email addresses.
  const ipWindowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: ipCount, error: ipRateError } = await supabase
    .from("otp_codes")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", ipWindowStart);

  if (ipRateError) return errorResponse("Could not verify request limit", 500, ipRateError.message);
  if ((ipCount ?? 0) >= 8) {
    return errorResponse(
      language === "en"
        ? "Too many verification requests. Please wait before requesting a new code."
        : "Te veel verificatieverzoeken. Wacht even voordat u een nieuwe code aanvraagt.",
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
    ip_hash: ipHash,
  });

  if (insertError) return errorResponse("Could not create verification code", 500);

  const subject = language === "en" ? "Your verification code" : "Uw verificatiecode";
  const intro = purpose === "contact"
    ? (language === "en" ? "Use this code to confirm your contact message:" : "Gebruik deze code om uw contactbericht te bevestigen:")
    : (language === "en" ? "Use this code to confirm your booking request:" : "Gebruik deze code om uw boekingsaanvraag te bevestigen:");
  const html = language === "en"
    ? `<h2>Your verification code</h2><p>${intro}</p><h1 style="letter-spacing:8px;font-size:36px;">${code}</h1><p>This code is valid for 15 minutes.</p>`
    : `<h2>Uw verificatiecode</h2><p>${intro}</p><h1 style="letter-spacing:8px;font-size:36px;">${code}</h1><p>Deze code is 15 minuten geldig.</p>`;

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

function cleanText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const rawIp = forwardedFor?.split(",")[0]
    || req.headers.get("cf-connecting-ip")
    || req.headers.get("x-real-ip")
    || "unknown";
  return cleanText(rawIp, 80) || "unknown";
}

async function hashIpAddress(ipAddress: string, salt: string): Promise<string> {
  const input = new TextEncoder().encode(`${salt}:${ipAddress}`);
  const hash = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
