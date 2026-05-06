import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

type CalendarSource = {
  id: string;
  property_id: string;
  source_name: string;
  ical_url: string;
};

type IcalEvent = {
  uid: string;
  startDate: string;
  endDate: string;
  summary: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return errorResponse("Method not allowed", 405);
  }

  const syncSecret = Deno.env.get("SYNC_SECRET");
  if (!syncSecret) {
    return errorResponse("Sync secret is not configured", 500);
  }
  const provided = req.headers.get("x-sync-secret");
  if (provided !== syncSecret) {
    return errorResponse("Unauthorized", 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return errorResponse("Supabase environment is not configured", 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: sources, error } = await supabase
    .from("calendar_sources")
    .select("id, property_id, source_name, ical_url")
    .eq("active", true)
    .returns<CalendarSource[]>();

  if (error) {
    return errorResponse("Could not load calendar sources", 500, error.message);
  }

  const results = [];

  for (const source of sources || []) {
    try {
      const response = await fetch(source.ical_url, {
        headers: { "User-Agent": "RentaVillaCuracao availability sync" },
      });
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }

      const icalText = await response.text();
      const events = parseIcal(icalText);
      const rows = events.map((event) => ({
        property_id: source.property_id,
        calendar_source_id: source.id,
        source: source.source_name,
        source_event_key: `${source.id}:${event.uid}:${event.startDate}:${event.endDate}`,
        external_event_id: event.uid,
        start_date: event.startDate,
        end_date: event.endDate,
        summary: event.summary || null,
        status: "blocked",
        synced_at: new Date().toISOString(),
      }));

      if (rows.length) {
        const { error: upsertError } = await supabase
          .from("availability_blocks")
          .upsert(rows, { onConflict: "source_event_key" });

        if (upsertError) {
          throw new Error(upsertError.message);
        }
      }

      const { data: existingBlocks, error: existingError } = await supabase
        .from("availability_blocks")
        .select("id, source_event_key")
        .eq("calendar_source_id", source.id);

      if (existingError) {
        throw new Error(existingError.message);
      }

      const activeKeys = new Set(rows.map((row) => row.source_event_key));
      const staleIds = (existingBlocks || [])
        .filter((block) => !activeKeys.has(block.source_event_key))
        .map((block) => block.id);

      if (staleIds.length) {
        const { error: deleteError } = await supabase
          .from("availability_blocks")
          .delete()
          .in("id", staleIds);

        if (deleteError) {
          throw new Error(deleteError.message);
        }
      }

      await supabase
        .from("calendar_sources")
        .update({ last_synced_at: new Date().toISOString(), last_error: null })
        .eq("id", source.id);

      results.push({ source: source.source_name, imported: rows.length, removed: staleIds.length, ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await supabase
        .from("calendar_sources")
        .update({ last_error: message })
        .eq("id", source.id);
      results.push({ source: source.source_name, imported: 0, ok: false, error: message });
    }
  }

  return jsonResponse({ ok: true, results });
});

function parseIcal(text: string): IcalEvent[] {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const eventBlocks = unfolded.split("BEGIN:VEVENT").slice(1);
  const events: IcalEvent[] = [];

  for (const block of eventBlocks) {
    const uid = readIcalValue(block, "UID") || crypto.randomUUID();
    const dtStart = readIcalValue(block, "DTSTART");
    const dtEnd = readIcalValue(block, "DTEND");
    const summary = readIcalValue(block, "SUMMARY") || "";

    if (!dtStart || !dtEnd) continue;

    const startDate = icalDateToIso(dtStart);
    const endDate = icalDateToIso(dtEnd);
    if (!startDate || !endDate || endDate <= startDate) continue;

    events.push({ uid, startDate, endDate, summary });
  }

  return events;
}

function readIcalValue(block: string, key: string): string | null {
  const match = block.match(new RegExp(`^${key}(?:;[^:\\r\\n]*)?:(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

function icalDateToIso(value: string): string | null {
  const dateOnly = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnly) {
    return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
  }

  const dateTime = value.match(/^(\d{4})(\d{2})(\d{2})T/);
  if (dateTime) {
    return `${dateTime[1]}-${dateTime[2]}-${dateTime[3]}`;
  }

  return null;
}
