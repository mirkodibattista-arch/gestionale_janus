import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const allowedOrigins = new Set([
  "https://istitutojanus.it",
  "https://www.istitutojanus.it",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const windows = new Map<string, { start: number; count: number }>();
const maxPerMinute = 5;

function responseJson(body: Record<string, unknown>, status: number, origin: string) {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "vary": "Origin",
  });
  if (allowedOrigins.has(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "POST, OPTIONS");
    headers.set("access-control-allow-headers", "authorization, apikey, x-client-info, content-type");
    headers.set("access-control-max-age", "86400");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text)) return null;
  return text;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  if (req.method === "OPTIONS") {
    return allowedOrigins.has(origin)
      ? responseJson({ ok: true }, 200, origin)
      : new Response(null, { status: 403 });
  }
  if (!allowedOrigins.has(origin)) return responseJson({ error: "Origine non autorizzata." }, 403, origin);
  if (req.method !== "POST") return responseJson({ error: "Metodo non consentito." }, 405, origin);
  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return responseJson({ error: "Formato non valido." }, 415, origin);
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > 8_192) return responseJson({ error: "Richiesta troppo grande." }, 413, origin);

  const clientIp = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "").trim();
  if (clientIp) {
    const now = Date.now();
    const previous = windows.get(clientIp);
    if (previous && now - previous.start < 60_000 && previous.count >= maxPerMinute) {
      return responseJson({ error: "Troppi invii ravvicinati. Riprova tra poco." }, 429, origin);
    }
    windows.set(clientIp, previous && now - previous.start < 60_000
      ? { start: previous.start, count: previous.count + 1 }
      : { start: now, count: 1 });
    if (windows.size > 5_000) {
      for (const [key, entry] of windows) if (now - entry.start > 60_000) windows.delete(key);
    }
  }

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 8_192) return responseJson({ error: "Richiesta troppo grande." }, 413, origin);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid body");
    body = parsed as Record<string, unknown>;
  } catch {
    return responseJson({ error: "Richiesta non valida." }, 400, origin);
  }

  if (typeof body.website === "string" && body.website.trim()) return responseJson({ ok: true }, 200, origin);

  const nome = cleanText(body.nome, 80);
  const cognome = cleanText(body.cognome, 80);
  const email = cleanText(body.email, 254)?.toLowerCase() ?? null;
  const telefono = cleanText(body.telefono, 32);
  const indirizzo = body.indirizzo_interesse == null || body.indirizzo_interesse === ""
    ? null : cleanText(body.indirizzo_interesse, 120);
  const modalita = body.modalita_interesse == null || body.modalita_interesse === ""
    ? null : cleanText(body.modalita_interesse, 40);
  const messaggio = body.messaggio == null || body.messaggio === ""
    ? null : cleanText(body.messaggio, 1_500);

  if (!nome || !cognome || !email || !telefono ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^[+()\d\s.-]{6,32}$/.test(telefono) ||
      (body.indirizzo_interesse && !indirizzo) ||
      (body.modalita_interesse && !modalita) ||
      (body.messaggio && !messaggio) ||
      (modalita && !["gold_experience", "gold_academy_live", "gold_digital"].includes(modalita)) ||
      body.informativa_letta !== true) {
    return responseJson({ error: "Controlla i campi obbligatori e la presa visione dell'informativa." }, 400, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Configurazione server Supabase mancante.");
    return responseJson({ error: "Servizio temporaneamente non disponibile." }, 503, origin);
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.from("richieste_contatto").insert({
    nome, cognome, email, telefono, indirizzo_interesse: indirizzo,
    modalita_interesse: modalita, messaggio, informativa_letta: true,
    versione_informativa: "consultazione-v1",
    consenso_marketing: body.consenso_marketing === true,
  });

  if (error) {
    console.error("Inserimento richiesta contatto non riuscito:", error.code);
    return responseJson({ error: "Non è stato possibile registrare la richiesta. Riprova." }, 500, origin);
  }
  return responseJson({ ok: true, message: "Richiesta ricevuta." }, 201, origin);
});
