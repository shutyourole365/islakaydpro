// Keep-alive: cron-pinged endpoint that actually issues a trivial query
// against the database, so both the Edge Function AND the underlying DB
// stay warm (Supabase auto-pauses free-tier projects after 7 days of no
// activity).
//
// Deployed with `verify_jwt: false` — the only public function in this
// project. SELECT 1 is the cheapest query that proves the DB is reachable.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseKey);
    // Touch any table to force a real DB roundtrip. profiles is guaranteed
    // to exist across all environments; limit(1) keeps the query trivial.
    await supabase.from("profiles").select("id").limit(1);

    const timestamp = new Date().toISOString();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Keep-alive ping successful",
        timestamp: timestamp,
        project: "pro.1",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("keep-alive error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
