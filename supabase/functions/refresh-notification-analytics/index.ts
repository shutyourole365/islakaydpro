// Triggers refresh_notification_analytics_cache() RPC and returns the last N
// days of cache rows. Used by the admin analytics dashboard.

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const days = params.get("days") || "7";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL" }), { status: 500 });
    }

    // 1) Trigger refresh via service_role.
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/refresh_notification_analytics_cache`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!rpcRes.ok) {
      const text = await rpcRes.text();
      return new Response(
        JSON.stringify({ error: "refresh_failed", details: text }),
        { status: 502 }
      );
    }

    // 2) Read back the cache table for the last N days.
    // Validate `days` — an invalid query-string (?days=foo) would make
    // parseInt return NaN, and `new Date(NaN).toISOString()` throws. Clamp
    // to a sensible 1..365 window.
    const parsedDays = parseInt(days, 10);
    const windowDays = Number.isFinite(parsedDays) && parsedDays >= 1 && parsedDays <= 365
      ? parsedDays
      : 7;
    const fromDate = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const res = await fetch(
      `${supabaseUrl}/rest/v1/notification_analytics_cache?select=*&date=gte.${fromDate}`,
      {
        method: "GET",
        headers: {
          "apikey": anonKey,
          "Authorization": `Bearer ${anonKey}`,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("notification_analytics_cache read failed:", res.status, text);
      return new Response(
        JSON.stringify({ error: "cache_read_failed" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(
      JSON.stringify({ ok: true, rows: data }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("refresh-notification-analytics error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
