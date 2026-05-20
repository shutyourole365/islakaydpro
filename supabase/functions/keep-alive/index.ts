// Keep-alive: cron-pinged endpoint that issues a trivial query against the
// database, so both the Edge Function AND the underlying DB stay warm
// (Supabase auto-pauses free-tier projects after 7 days of no activity).
//
// Deployed with `verify_jwt: false` — the only public function in this
// project. Uses the **anon** key, not service-role: a public endpoint
// must never run with elevated privileges. Anon access is enough to
// touch a table; RLS handles the rest.
//
// Pinned to @supabase/supabase-js@2.39.3 to match the shared import_map.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

Deno.serve(async (_req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !anonKey) {
      console.error("keep-alive: missing SUPABASE_URL or SUPABASE_ANON_KEY");
      return new Response(
        JSON.stringify({ success: false, error: "Configuration error" }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, anonKey);
    // Touch any table to force a real DB roundtrip. profiles is guaranteed
    // to exist; SELECT id LIMIT 1 is trivial under any RLS policy that
    // allows anon to see profile rows (most marketplace apps expose at
    // least public profile data).
    //
    // supabase-js returns { data, error } rather than throwing, so we have
    // to check `error` explicitly — otherwise an RLS denial or schema
    // mismatch would silently report 'success: true'.
    const { error: dbError } = await supabase.from("profiles").select("id").limit(1);
    if (dbError) {
      throw dbError;
    }

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
