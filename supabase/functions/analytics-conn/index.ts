// Analytics-user DB connection probe. Connects to Postgres as `analytics_user`
// (separate from service_role) and runs a trivial SELECT to confirm credentials
// + network reachability for the analytics pipeline.

import pkg from "npm:pg@8.10.0";
const { Client } = pkg;

Deno.serve(async (_req: Request) => {
  try {
    const password = Deno.env.get("SUPABASE_ANALYTICS_USER_PASSWORD");
    if (!password) {
      return new Response(
        JSON.stringify({ error: "Missing analytics password env var" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseDbUrl = Deno.env.get("SUPABASE_DB_URL");
    let connectionString: string | null = null;

    if (supabaseDbUrl) {
      const url = new URL(supabaseDbUrl);
      url.username = "analytics_user";
      url.password = password;
      connectionString = url.toString();
    } else {
      const host = Deno.env.get("SUPABASE_DB_HOST") ?? Deno.env.get("DB_HOST");
      const port = Deno.env.get("SUPABASE_DB_PORT") ?? "5432";
      const db = Deno.env.get("SUPABASE_DB_NAME") ?? "postgres";
      if (!host) {
        return new Response(
          JSON.stringify({ error: "Missing SUPABASE_DB_URL and SUPABASE_DB_HOST" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      connectionString = `postgresql://analytics_user:${encodeURIComponent(password)}@${host}:${port}/${db}?sslmode=require`;
    }

    const client = new Client({ connectionString });
    await client.connect();

    // try/finally so the client is closed even if query() throws — otherwise
    // the connection leaks until the Edge Function isolate is recycled.
    let rows: Array<Record<string, unknown>> | undefined;
    try {
      const res = await client.query("SELECT current_database() AS db, now() AS now");
      rows = res.rows;
    } finally {
      await client.end();
    }

    return new Response(
      JSON.stringify({
        ok: true,
        database: rows?.[0]?.db ?? null,
        now: rows?.[0]?.now ?? null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("analytics-conn error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
