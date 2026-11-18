import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler, type Dependencies } from "../supabase/functions/richieste-orientamento/handler.ts";
import { parseDatabaseUrl, parseOrigins, verifiedUserId } from "../supabase/functions/richieste-orientamento/config.ts";
import { stagingUrl } from "../supabase/functions/_shared/janusOrientation.ts";

const id = "00000000-0000-4000-8000-000000000001";
const origin = "https://preview.example.test";
const token = "fake.token.signature";

function setup(role: string | null = "Admin") {
  const calls: string[] = [];
  const deps: Dependencies = {
    origins: new Set([origin]),
    identify: async (jwt) => jwt === token ? id : null,
    read: async (read) => read({
      profile: async (uid) => {
        assert.equal(uid, id);
        calls.push("profile");
        return role ? { role } : null;
      },
      list: async () => {
        calls.push("list");
        return { items: [], total: 0, counts: { nuova: 0, contattata: 0, in_valutazione: 0, chiusa: 0 } };
      },
      detail: async () => { calls.push("detail"); return null; },
    }),
  };
  const handler = createHandler(deps);
  const request = (action: unknown, overrides?: RequestInit) => handler(new Request(
    "https://example.test/functions/v1/richieste-orientamento",
    { method: "POST", headers: { Origin: origin, Authorization: `Bearer ${token}`,
      "Content-Type": "application/json" }, body: JSON.stringify(action), ...overrides },
  ));
  return { calls, request };
}

test("solo i tre ruoli abilitati leggono liste e dettagli", async () => {
  for (const role of ["Admin", "Supervisore", "Segreteria"]) {
    const { calls, request } = setup(role);
    const profile = await request({ action: "profile" });
    assert.deepEqual(await profile.json(), { id, role });
    const list = await request({ action: "list", page: 1, search: "", status: "nuova", modality: "" });
    assert.equal(list.status, 200);
    assert.match(list.headers.get("cache-control")!, /no-store/);
    assert.equal((await request({ action: "detail", id })).status, 404);
    assert.deepEqual(calls, ["profile", "profile", "list", "profile", "detail"]);
  }
});

test("JWT assente o non valido e profili non autorizzati non espongono dati", async () => {
  for (const role of [null, "Audit", "Didattica", "Amministrazione", "Tutor", "Studente"]) {
    const { calls, request } = setup(role);
    assert.equal((await request({ action: "profile", role: "Admin" })).status, 403);
    assert.equal((await request({ action: "detail", id })).status, 403);
    assert.deepEqual(calls, ["profile", "profile"]);
  }
  const { calls, request } = setup();
  for (const headers of [{}, { Authorization: "Bearer demo" }, { Authorization: "Bearer a.b.c" }]) {
    assert.equal((await request({ action: "profile" }, { headers })).status, 401);
  }
  assert.deepEqual(calls, []);
});

test("CORS, input, limiti e metodi rifiutati", async () => {
  const { calls, request } = setup();
  const preflight = await request(null, { method: "OPTIONS", body: undefined });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
  const denied = await request({ action: "profile" }, { headers: { Origin: "https://esterno.test" } });
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get("access-control-allow-origin"), null);
  assert.equal((await request(null, { method: "GET", body: undefined })).status, 405);
  for (const action of [
    { action: "update", id },
    { action: "detail", id: "x" },
    { action: "list", page: 1001, search: "", status: "", modality: "" },
    { action: "list", page: 1, search: "", status: "altro", modality: "" },
    { action: "list", page: 1, search: "x".repeat(5000), status: "", modality: "" },
  ]) assert.equal((await request(action)).status, 400);
  assert.deepEqual(calls, []);
});

test("configurazione e claim limitati al progetto staging", () => {
  const connection = "postgresql://janus_orientation_edge:secret@db.rwaotjfhiyhndlgljuuo.supabase.co:5432/postgres";
  assert.equal(parseDatabaseUrl(connection).username, "janus_orientation_edge");
  assert.throws(() => parseDatabaseUrl(connection.replace("janus_orientation_edge", "postgres")));
  assert.throws(() => parseDatabaseUrl(connection.replace("rwaotjfhiyhndlgljuuo", "xengiuzlqjymjusajcih")));
  assert.throws(() => parseDatabaseUrl(connection + "?sslmode=disable"));
  assert.throws(() => parseOrigins("*"));
  assert.throws(() => parseOrigins("http://preview.example.test"));
  assert.deepEqual([...parseOrigins(origin)], [origin]);
  const claims = { iss: stagingUrl + "/auth/v1", aud: "authenticated", role: "authenticated",
    exp: 2000, sub: id, is_anonymous: false };
  assert.equal(verifiedUserId(claims, 1000000), id);
  for (const invalid of [
    { ...claims, exp: 999 }, { ...claims, aud: "anon" }, { ...claims, role: "service_role" },
    { ...claims, is_anonymous: true }, { ...claims, iss: "https://example.test/auth/v1" },
  ]) assert.equal(verifiedUserId(invalid, 1000000), null);
});

test("firma JWT verificata dall'SDK con JWKS sintetico e rete intercettata", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const { createIdentityVerifier } = await import("../supabase/functions/richieste-orientamento/identity.ts");
  const pair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"],
  );
  const kid = "janus-test-local";
  const jwk = { ...await crypto.subtle.exportKey("jwk", pair.publicKey), kid, alg: "ES256", use: "sig" };
  const fetchMock = (target: RequestInfo | URL) => {
    assert.equal(String(target), stagingUrl + "/auth/v1/.well-known/jwks.json");
    return Promise.resolve(Response.json({ keys: [jwk] }));
  };
  const { auth } = createClient(stagingUrl, "sb_publishable_fake_test_only", {
    global: { fetch: fetchMock },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const identity = createIdentityVerifier(auth);
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const claims = { iss: stagingUrl + "/auth/v1", aud: "authenticated", role: "authenticated",
    sub: id, exp: Math.floor(Date.now() / 1000) + 120, is_anonymous: false };
  async function sign(payload: typeof claims) {
    const parts = encode({ alg: "ES256", typ: "JWT", kid }) + "." + encode(payload);
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" }, pair.privateKey, new TextEncoder().encode(parts),
    );
    return parts + "." + Buffer.from(signature).toString("base64url");
  }
  const jwt = await sign(claims);
  assert.equal(await identity("a.b.c"), null);
  assert.equal(await identity(jwt), id);
  const [header, , signature] = jwt.split(".");
  assert.equal(await identity(`${header}.${encode({ ...claims, sub: crypto.randomUUID() })}.${signature}`), null);
  assert.equal(await identity(await sign({ ...claims, exp: 1 })), null);
  assert.equal(await identity(await sign({ ...claims, iss: "https://altro.example.test/auth/v1" })), null);
});
