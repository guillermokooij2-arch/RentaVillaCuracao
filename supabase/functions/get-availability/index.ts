import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return errorResponse("Method not allowed", 405);
  }

  const url = new URL(req.url);
  const villaSlug = (url.searchParams.get("villa") || "").trim();
  const from = url.searchParams.get("from") || todayIso();
  const to = url.searchParams.get("to") || addYearsIso(1);

  if (!villaSlug) {
    return errorResponse("Missing villa parameter");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return errorResponse("Supabase environment is not configured", 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, slug, name")
    .eq("slug", villaSlug)
    .eq("active", true)
    .single<{ id: string; slug: string; name: string }>();

  if (propertyError || !property) {
    return errorResponse("Villa not found", 404);
  }

  const { data: blocks, error: blocksError } = await supabase
    .from("availability_blocks")
    .select("start_date, end_date, source, summary")
    .eq("property_id", property.id)
    .lt("start_date", to)
    .gt("end_date", from)
    .order("start_date", { ascending: true });

  if (blocksError) {
    return errorResponse("Could not load availability", 500, blocksError.message);
  }

  return jsonResponse({
    ok: true,
    villa: property.slug,
    blockedDates: expandDateRanges(blocks || []),
    blocks: blocks || [],
  });
});

function expandDateRanges(blocks: Array<{ start_date: string; end_date: string }>): string[] {
  const dates = new Set<string>();
  for (const block of blocks) {
    const current = new Date(`${block.start_date}T00:00:00Z`);
    const end = new Date(`${block.end_date}T00:00:00Z`);
    while (current < end) {
      dates.add(current.toISOString().slice(0, 10));
      current.setUTCDate(current.getUTCDate() + 1);
    }
  }
  return Array.from(dates).sort();
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addYearsIso(years: number): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString().slice(0, 10);
}
