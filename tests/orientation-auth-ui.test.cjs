const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");
const { JSDOM } = require("jsdom");
const React = require("react");
const { act } = React;

const url = "https://rwaotjfhiyhndlgljuuo.supabase.co";
const userId = "00000000-0000-4000-8000-000000000001";
const requestId = "00000000-0000-4000-8000-000000000002";

test("login reale, sessione isolata, dashboard, filtri, dettaglio e revoca con servizi simulati", async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost:5173/login" });
  const { window } = dom;
  Object.assign(global, { window, document: window.document, IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
  const { createRoot } = require("react-dom/client");
  const calls = [];
  let observer;
  let active = true;
  let credential = null;
  let signedOut = 0;
  const fakeSession = {
    access_token: "mock.auth.token",
    expires_at: Math.floor(Date.now() / 1000) + 300,
    user: { id: userId, email: "operatore@example.test" },
  };
  const key = "sb_publishable_fake_test_only";
  const env = { VITE_AUTH_MODE: "supabase", VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: key };
  const client = {
    auth: {
      onAuthStateChange(callback) {
        observer = callback;
        callback("INITIAL_SESSION", credential);
        return { data: { subscription: { unsubscribe() { observer = undefined; } } } };
      },
      async signInWithPassword({ email, password }) {
        assert.equal(email, "operatore@example.test");
        assert.equal(password, "password-sintetica");
        credential = fakeSession;
        observer?.("SIGNED_IN", credential);
        return { data: { session: credential }, error: null };
      },
      async signOut(options) {
        assert.deepEqual(options, { scope: "local" });
        signedOut++;
        credential = null;
        observer?.("SIGNED_OUT", null);
        return { error: null };
      },
    },
  };
  const row = {
    id: requestId, nome: "Jane", cognome: "Collaudo", email: "jane@example.test",
    telefono: "12345678", indirizzo_interesse: "Informatica", modalita_interesse: "gold_digital",
    stato: "nuova", ricevuta_il: "2026-11-18T09:00:00.000Z",
  };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const source = readFileSync(file, "utf8").replaceAll("import.meta.env", JSON.stringify(env));
    const code = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    } }).outputText;
    const result = { exports: {} };
    cache.set(file, result);
    new Function("require", "module", "exports", code)((id) => {
      if (id === "@supabase/supabase-js") return {
        createClient(host, publicKey, options) {
          assert.equal(host, url);
          assert.equal(publicKey, key);
          if (!options.auth.persistSession) return { functions: { invoke() { assert.fail("Form invocato"); } } };
          assert.equal(options.auth.storageKey, "janus.staging.auth.v1");
          return client;
        },
      };
      if (!id.startsWith(".")) return require(id);
      const location = path.resolve(path.dirname(file), id);
      const resolved = [".tsx", ".ts", ".js"].map((ext) => location + ext).find(existsSync);
      assert.ok(resolved, id);
      return load(resolved);
    }, result, result.exports);
    return result.exports;
  }

  const originalFetch = global.fetch;
  global.fetch = async (target, request) => {
    assert.equal(target, url + "/functions/v1/richieste-orientamento");
    assert.equal(request.headers.Authorization, "Bearer " + fakeSession.access_token);
    const body = JSON.parse(request.body);
    calls.push(body);
    if (!active) return new Response(null, { status: 403 });
    if (body.action === "profile") return Response.json({ id: userId, role: "Segreteria" });
    if (body.action === "detail") return Response.json({ ...row, messaggio: "Messaggio sintetico" });
    return Response.json({ items: [row], total: 21,
      counts: { nuova: 21, contattata: 0, in_valutazione: 0, chiusa: 0 } });
  };

  const root = createRoot(document.querySelector("#root"));
  const click = (selector) => act(async () => document.querySelector(selector).click());
  const route = (urlPath) => act(async () => {
    window.history.pushState(null, "", urlPath);
    window.dispatchEvent(new window.PopStateEvent("popstate"));
  });
  const setInput = (selector, value) => act(async () => {
    const input = document.querySelector(selector);
    const proto = Object.getPrototypeOf(input);
    Object.getOwnPropertyDescriptor(proto, "value").set.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    input.dispatchEvent(new window.Event("change", { bubbles: true }));
  });

  try {
    window.scrollTo = () => {};
    window.localStorage.setItem("janus.demo-auth.v1", '{"id":"demo"}');
    const App = load(path.resolve("src/App.tsx")).default;
    await act(async () => root.render(React.createElement(App)));
    assert.equal(calls.length, 0);
    assert.ok(!document.querySelector(".auth-accounts"));
    await setInput("#login-email", "operatore@example.test");
    await setInput("#login-password", "password-sintetica");
    await click(".auth-submit");
    assert.equal(window.location.pathname, "/campus/richieste-orientamento");
    assert.deepEqual(calls.slice(0, 2).map((call) => call.action), ["profile", "list"]);
    assert.match(document.body.textContent, /Jane Collaudo/);
    await click("button[aria-label='Dettagli di Jane Collaudo']");
    assert.equal(calls.at(-1).id, requestId);
    assert.match(document.body.textContent, /Messaggio sintetico/);
    await click(".inbox-pages button:last-child");
    assert.equal(calls.at(-1).page, 2);
    await setInput(".inbox-filters select", "nuova");
    assert.equal(calls.at(-1).status, "nuova");
    assert.equal(calls.at(-1).page, 1);
    await setInput(".inbox-search input", "Jane");
    await click(".inbox-search button");
    assert.equal(calls.at(-1).search, "Jane");

    await route("/campus/studenti");
    assert.match(document.body.textContent, /Accesso negato/);
    assert.doesNotMatch(document.body.textContent, /Jane Collaudo/);
    await route("/campus/richieste-orientamento");
    await click(".inbox-header button");
    assert.equal(signedOut, 1);
    assert.match(document.body.textContent, /Accedi a JANUS/);
    assert.doesNotMatch(document.body.textContent, /Jane Collaudo/);

    await act(async () => observer("SIGNED_IN", fakeSession));
    assert.match(document.body.textContent, /Jane Collaudo/);
    await act(async () => observer("TOKEN_REFRESHED", { ...fakeSession, expires_at: 1 }));
    assert.match(document.body.textContent, /sessione è scaduta/);
    assert.doesNotMatch(document.body.textContent, /Jane Collaudo/);

    await act(async () => observer("SIGNED_IN", fakeSession));
    active = false;
    await setInput(".inbox-filters select", "contattata");
    assert.equal(signedOut, 2);
    assert.match(document.body.textContent, /Accedi a JANUS/);
    assert.doesNotMatch(document.body.textContent, /Jane Collaudo/);
  } finally {
    await act(async () => root.unmount());
    global.fetch = originalFetch;
    window.close();
  }
});
