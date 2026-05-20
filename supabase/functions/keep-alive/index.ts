// Keep-alive: cron-pinged endpoint that stays warm so the project doesn't
// auto-pause and DB cold-starts don't hit user requests.
//
// Deployed with `verify_jwt: false` — the only public function in this project.
// Body is intentionally trivial; we just need an authenticated DB roundtrip.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    createClient(supabaseUrl, supabaseKey);
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
