import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import postgres from "npm:postgres@3.4.8";
import { stagingUrl } from "../_shared/janusOrientation.ts";
import { createHandler } from "./handler.ts";
import { parseDatabaseUrl, parseOrigins } from "./config.ts";
import { createIdentityVerifier } from "./identity.ts";
import { createReader } from "./repository.ts";

function configure() {
  if (Deno.env.get("SUPABASE_URL") !== stagingUrl) {
    throw new Error("Funzione riservata al progetto staging.");
  }
  const key = Deno.env.get("JANUS_STAGING_AUTH_PUBLISHABLE_KEY") ?? "";
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    throw new Error("Configurare la chiave pubblicabile staging.");
  }
  const auth = createClient(stagingUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }).auth;
  const database = parseDatabaseUrl(
    Deno.env.get("JANUS_STAGING_ORIENTATION_DB_URL") ?? "",
  );
  const origins = parseOrigins(
    Deno.env.get("JANUS_STAGING_ORIENTATION_ALLOWED_ORIGINS") ?? "",
  );
  const ca = Deno.env.get("JANUS_STAGING_ORIENTATION_DB_CA");
  const sql = postgres(database.href, {
    ssl: { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
    max: 1,
    connect_timeout: 5,
    idle_timeout: 10,
    max_lifetime: 300,
    prepare: false,
    fetch_types: false,
    connection: { application_name: "janus_orientation_edge" },
  });

  return createHandler({
    origins,
    identify: createIdentityVerifier(auth),
    read: createReader(sql),
  });
}

let handler: ReturnType<typeof configure> | undefined;
try {
  handler = configure();
} catch {
  console.error("Configurazione richieste-orientamento non valida.");
}
Deno.serve((request) =>
  handler ? handler(request) : new Response(
    JSON.stringify({ error: "unavailable" }),
    {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  )
);
