import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  let payload: { email?: string; code?: string };
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Invalid JSON");
  }

  const email = (payload.email || "").trim().toLowerCase();
  const code = (payload.code || "").trim();

  if (!email || !code) return errorResponse("Missing email or code");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return errorResponse("Server not configured", 500);

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data: otp, error } = await supabase
    .from("otp_codes")
    .select("id, code, expires_at, used")
    .eq("email", email)
    .eq("used", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single<{ id: string; code: string; expires_at: string; used: boolean }>();

  if (error || !otp) {
    return errorResponse("No valid code found. Request a new one.", 400);
  }

  if (otp.code !== code) {
    return errorResponse("Incorrect code.", 400);
  }

  await supabase.from("otp_codes").update({ used: true }).eq("id", otp.id);

  // Return a short-lived token the booking form uses to prove verification
  const token = crypto.randomUUID();
  const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  await supabase.from("otp_codes").update({ verification_token: token, token_expires_at: tokenExpiry }).eq("id", otp.id);

  return jsonResponse({ ok: true, token });
});
