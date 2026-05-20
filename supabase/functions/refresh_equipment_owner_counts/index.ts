// Calls the refresh_equipment_owner_counts() SQL function (REFRESH MATERIALIZED
// VIEW CONCURRENTLY public.equipment_owner_counts). Wired to a cron schedule
// in the Supabase dashboard.

import { createClient } from "npm:@supabase/supabase-js@2.35.0";

Deno.serve(async (_req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  try {
    const { error } = await supabase.rpc("refresh_equipment_owner_counts");
    if (error) {
      console.error("refresh_equipment_owner_counts rpc error:", error);
      return new Response(JSON.stringify({ error: "Refresh failed" }), { status: 500 });
    }
    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
  } catch (err) {
    console.error("refresh_equipment_owner_counts error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
