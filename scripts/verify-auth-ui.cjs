// Test di integrazione React in jsdom. Non è un browser completo né un test Windows.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { JSDOM } = require("jsdom");
const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: "http://janus.test/#/login" },
);
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "HTMLInputElement",
  "Event",
  "MouseEvent",
  "StorageEvent",
])
  global[key] = dom.window[key];
Object.defineProperty(global, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
window.scrollTo = () => {};
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require("react");
const { act } = React;
const { createRoot } = require("react-dom/client");
const cache = new Map();
let backendCalls = 0;
const mode = process.argv.includes("--disabled") ? "disabled" : "demo";
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const source = fs
    .readFileSync(file, "utf8")
    .replaceAll("import.meta.env", JSON.stringify({ VITE_AUTH_MODE: mode }));
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const result = { exports: {} };
  new Function("require", "module", "exports", code)(
    (id) => {
      if (!id.startsWith(".")) return require(id);
      const candidate = path.resolve(path.dirname(file), id);
      if (candidate.endsWith("/src/lib/supabase"))
        return {
          supabase: {
            functions: {
              invoke() {
                backendCalls++;
                throw Error("Backend forbidden");
              },
            },
          },
        };
      const resolved = [".tsx", ".ts", ".js"]
        .map((ext) => candidate + ext)
        .find((f) => fs.existsSync(f));
      if (!resolved) throw Error(`Unknown module ${id}`);
      return load(resolved);
    },
    result,
    result.exports,
  );
  cache.set(file, result.exports);
  return result.exports;
}
const App = load(path.resolve(__dirname, "../src/App.tsx")).default;
let root;
const sleep = () => new Promise((resolve) => setTimeout(resolve, 10));
async function start(hash = "#/login", keep = false) {
  if (root) await act(async () => root.unmount());
  if (!keep) window.localStorage.clear();
  window.history.replaceState(null, "", hash);
  root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(App)));
}
async function route(hash) {
  await act(async () => {
    window.location.hash = hash;
    await sleep();
  });
}
async function input(id, value) {
  const node = document.getElementById(id);
  assert.ok(node, `Input ${id}`);
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set.call(node, value);
    node.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}
async function click(selector) {
  const button = document.querySelector(selector);
  assert.ok(button, selector);
  await act(async () => {
    button.click();
    await sleep();
  });
}
async function login(role) {
  await route("#/login");
  await input("login-email", `${role.toLowerCase()}@janus-demo.test`);
  await input("login-password", "CampusDemo!2026");
  await act(async () => {
    document
      .querySelector(".auth-card form")
      .dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true }),
      );
    await sleep();
  });
  assert.equal(document.querySelector(".account-role b")?.textContent, role);
  assert.equal(window.location.hash, "#/campus/dashboard");
}
(async () => {
  await start();
  if (mode === "disabled") {
    assert.ok(document.querySelector(".auth-submit").disabled);
    assert.ok(
      document
        .querySelector('[role="alert"]')
        .textContent.includes("disattivata"),
    );
    await route("#/campus/dashboard");
    assert.equal(document.querySelector(".dashboard-shell"), null);
    await act(async () => root.unmount());
    dom.window.close();
    console.log("UI React: disattivazione demo verificata.");
    return;
  }
  await start("#/campus/dashboard");
  assert.ok(document.querySelector("#login-email"));
  assert.equal(document.querySelector(".dashboard-shell"), null);
  await start();
  await input("login-email", "studente@janus-demo.test");
  await input("login-password", "wrong");
  await click('button[aria-label="Mostra password"]');
  assert.equal(document.getElementById("login-password").type, "text");
  await click('button[aria-label="Nascondi password"]');
  assert.equal(document.getElementById("login-password").type, "password");
  await act(async () => {
    document
      .querySelector(".auth-card form")
      .dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true }),
      );
    await sleep();
  });
  assert.ok(
    document.querySelector("#login-error").textContent.includes("non corretti"),
  );
  for (const role of [
    "Admin",
    "Supervisore",
    "Segreteria",
    "Amministrazione",
    "Didattica",
    "Tutor",
    "Studente",
  ]) {
    await start();
    await login(role);
    assert.equal(document.querySelector(".dashboard-shell select"), null);
    assert.ok(document.querySelectorAll(".kpi-card").length === 4);
    if (["Studente", "Tutor", "Segreteria"].includes(role))
      assert.ok(
        !document
          .querySelector(".dash-sidebar")
          .textContent.includes("Amministrazione"),
      );
    if (role === "Studente")
      assert.ok(
        document
          .querySelector("h1")
          .textContent.includes("Il tuo prossimo traguardo"),
      );
    if (role === "Tutor")
      assert.ok(
        document
          .querySelector("h1")
          .textContent.includes("Il tuo spazio di tutoraggio"),
      );
    // Remount alla stessa URL: ripristino della sessione dopo ricaricamento.
    await start("#/campus/dashboard", true);
    assert.equal(document.querySelector(".account-role b").textContent, role);
    const href = document
      .querySelectorAll(".dash-sidebar nav a")[1]
      .getAttribute("href");
    await route(href);
    assert.ok(document.querySelector(".module-preview"));
    await click(".module-preview a");
    assert.ok(document.querySelector(".account-role"));
    await click(".mobile-menu");
    assert.ok(document.querySelector(".mobile-dash-menu"));
    await click(".mobile-dash-menu a:nth-child(2)");
    assert.equal(document.querySelector(".mobile-dash-menu"), null);
    await route("#/campus/dashboard");
    if (["Studente", "Tutor", "Segreteria"].includes(role)) {
      await route("#/campus/amministrazione");
      assert.ok(
        document.querySelector("h1").textContent.includes("Accesso negato"),
      );
      assert.equal(document.querySelector(".dashboard-shell"), null);
      await click(".auth-status .auth-submit");
      assert.ok(document.querySelector(".account-role"));
    }
    await click(".campus-logout");
    assert.ok(document.querySelector("#login-email"));
    await route("#/campus/dashboard");
    assert.equal(document.querySelector(".dashboard-shell"), null);
    console.log(`UI React: ${role} login, route, sessione e logout OK`);
  }
  await start();
  await login("Studente");
  // Simula la notifica storage che il browser emette dopo il logout in un'altra scheda.
  await act(async () => {
    window.localStorage.removeItem("janus.demo-auth.v1");
    window.dispatchEvent(
      new window.StorageEvent("storage", { key: "janus.demo-auth.v1" }),
    );
  });
  assert.ok(document.querySelector("#login-email"));
  assert.equal(document.querySelector(".dashboard-shell"), null);
  await login("Studente");
  await act(async () => {
    const saved = JSON.parse(window.localStorage.getItem("janus.demo-auth.v1"));
    saved.issuedAt = Date.now() - 8 * 60 * 60 * 1000 - 100;
    window.localStorage.setItem("janus.demo-auth.v1", JSON.stringify(saved));
    window.dispatchEvent(new window.Event("focus"));
  });
  assert.ok(document.querySelector("#login-email"));
  await route("#/campus/%bad");
  assert.ok(
    document.querySelector("h1").textContent.includes("Pagina non trovata"),
  );
  await act(async () => root.unmount());
  dom.window.close();
  assert.equal(backendCalls, 0);
  console.log(
    "UI React: credenziali errate, password visibile/nascosta, sessione cross-tab simulata, expiry e route sconosciute OK. Nessuna chiamata Supabase.",
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
