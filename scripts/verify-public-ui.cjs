// Test di integrazione React in jsdom. Non è un browser completo né un test Windows.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { JSDOM } = require("jsdom");
const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: "http://janus.test/login" },
);
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "HTMLInputElement",
  "Event",
  "MouseEvent",
  "StorageEvent",
  "FormData",
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
let simulated = "error";
const submissions = [];
global.fetch = () => {
  backendCalls++;
  throw Error("No network permitted in demo tests");
};
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
              async invoke(name, options) {
                submissions.push({ name, body: options.body });
                if (simulated === "throw") throw Error("Errore simulato");
                return {
                  error:
                    simulated === "error"
                      ? { message: "Errore simulato" }
                      : null,
                };
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
async function start(hash = "/login", keep = false) {
  if (root) await act(async () => root.unmount());
  if (!keep) window.localStorage.clear();
  window.history.replaceState(null, "", hash);
  root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(App)));
  await act(async () => {
    await sleep();
  });
}
async function route(hash) {
  await act(async () => {
    const { navigate } = load(
      path.resolve(__dirname, "../src/routing/routes.ts"),
    );
    navigate(hash);
    await sleep();
  });
  await act(async () => {
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
async function submit(selector) {
  await act(async () => {
    document
      .querySelector(selector)
      .dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true }),
      );
    await sleep();
  });
}
(async () => {
  await start("/");
  assert.ok(document.querySelector(".hero-section"));
  assert.ok(document.querySelector("#nome"));
  assert.equal(document.querySelector("#login-email"), null);
  assert.ok(
    document
      .querySelector(".public-campus-cta")
      .textContent.includes("SEI GIÀ ISCRITTO? ACCEDI AL DIGITAL CAMPUS"),
  );
  assert.equal(submissions.length, 0);
  await input("nome", "Persona");
  await click(".public-campus-cta");
  assert.equal(window.location.pathname, "/login");
  assert.ok(document.querySelector("#login-email"));
  await click(".auth-brand a.auth-back");
  assert.equal(window.location.pathname, "/");
  assert.equal(document.querySelector("#nome").value, "Persona");
  await click(".public-campus-cta");
  await act(async () => {
    window.history.back();
    await sleep();
  });
  await act(async () => {
    await sleep();
  });
  assert.equal(window.location.pathname, "/");
  assert.equal(document.querySelector("#nome").value, "Persona");
  await click(".action-next");
  assert.ok(
    document.querySelector(".form-error").textContent.includes("Compila"),
  );
  await input("cognome", "Demo");
  await input("email", "persona@example.test");
  await input("telefono", "+39 000 0000000");
  await click(".action-next");
  await click('.public-access-options a[href="/orientamento#richiesta"]');
  assert.equal(window.location.pathname, "/orientamento");
  assert.equal(document.querySelector(".hero-section"), null);
  assert.equal(document.querySelectorAll(".form-section").length, 1);
  assert.ok(
    document
      .querySelector(".public-orientation-note")
      .textContent.includes("non costituisce un’iscrizione"),
  );
  const selects = document.querySelectorAll(".form-card select");
  const course = selects[0].options[1].value;
  await act(async () => {
    selects[0].value = course;
    selects[0].dispatchEvent(new window.Event("change", { bubbles: true }));
    selects[1].value = "gold_digital";
    selects[1].dispatchEvent(new window.Event("change", { bubbles: true }));
  });
  await click(".action-next");
  assert.ok(
    document.querySelector(".review-card").textContent.includes("Persona Demo"),
  );
  assert.equal(
    document.querySelector('.form-actions button[type="submit"]').disabled,
    true,
  );
  await click('.check-row input[type="checkbox"]');
  await submit(".form-card form");
  assert.ok(
    document
      .querySelector(".form-error")
      .textContent.includes("Invio non riuscito"),
  );
  assert.equal(document.querySelector(".success-state"), null);
  simulated = "throw";
  await submit(".form-card form");
  assert.ok(document.querySelector(".form-error"));
  simulated = "success";
  await submit(".form-card form");
  assert.ok(document.querySelector(".success-state"));
  assert.equal(submissions.length, 3);
  for (const call of submissions) {
    assert.equal(call.name, "richiesta-contatto");
    assert.deepEqual(call.body, {
      nome: "Persona",
      cognome: "Demo",
      email: "persona@example.test",
      telefono: "+39 000 0000000",
      indirizzo_interesse: course,
      modalita_interesse: "gold_digital",
      messaggio: "",
      informativa_letta: true,
      consenso_marketing: false,
      website: "",
    });
  }
  assert.equal(window.localStorage.getItem("janus.demo-auth.v1"), null);
  await route("/login");
  await input("login-email", "admin@janus-demo.test");
  await input("login-password", "CampusDemo!2026");
  await submit(".auth-card form");
  assert.equal(window.location.pathname, "/campus/dashboard");
  await route("/campus/studenti");
  assert.ok(
    document
      .querySelector(".cp-panel-head p")
      .textContent.startsWith("24 studenti demo"),
  );
  // Home remains public even for signed-in staff; it never becomes a login page.
  await route("/");
  assert.ok(document.querySelector(".hero-section"));
  assert.ok(document.querySelector(".success-state"));
  await click(".success-state button");
  assert.equal(document.querySelector("#nome").value, "");
  await route("/orientamento");
  await start("/orientamento", true);
  assert.ok(document.querySelector("#nome"));
  assert.equal(document.querySelectorAll(".form-section").length, 1);
  assert.equal(backendCalls, 0);
  await act(async () => root.unmount());
  dom.window.close();
  // Keep transport contracts identical to main; allow only the approved CORS additions.
  const { execFileSync } = require("node:child_process");
  for (const file of [
    "src/modules/orientation/hooks/useOrientationForm.ts",
    "src/modules/orientation/components/ContactRequestForm.tsx",
    "src/lib/supabase.ts",
  ]) {
    assert.equal(
      fs.readFileSync(path.resolve(__dirname, "..", file), "utf8"),
      execFileSync("git", ["show", `09b5e9c:${file}`], {
        cwd: path.resolve(__dirname, ".."),
        encoding: "utf8",
      }),
    );
  }
  const edgeFile = "supabase/functions/richiesta-contatto/index.ts";
  const edgeSource = fs.readFileSync(path.resolve(__dirname, "..", edgeFile), "utf8");
  const edgeReference = execFileSync("git", ["show", `09b5e9c:${edgeFile}`], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  const cloudflareOrigins = [
    "https://gestionale-janus.pages.dev",
    "https://feat-janus-public-home-login.gestionale-janus.pages.dev",
    "https://7299938a.gestionale-janus.pages.dev",
  ];
  const corsAnchor = '  "https://www.istitutojanus.it",\n';
  assert.equal(edgeReference.split(corsAnchor).length, 2, "Unique CORS anchor required");
  const expectedEdgeSource = edgeReference.replace(
    corsAnchor,
    corsAnchor + cloudflareOrigins.map((origin) => `  "${origin}",\n`).join(""),
  );
  assert.equal(
    edgeSource,
    expectedEdgeSource,
    "Only the three approved CORS additions may differ from the reference",
  );

  // Run the actual handler in memory, with the SDK and network blocked.
  const { runInNewContext } = require("node:vm");
  let edgeHandler;
  runInNewContext(
    ts.transpileModule(edgeSource, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports: {},
      require(id) {
        assert.equal(id, "npm:@supabase/supabase-js@2.95.0");
        return {
          createClient() {
            throw Error("No database access permitted in CORS tests");
          },
        };
      },
      Deno: { serve(handler) { edgeHandler = handler; } },
      Headers,
      Response,
      fetch() { throw Error("No network permitted in CORS tests"); },
    },
    { filename: edgeFile },
  );
  assert.equal(typeof edgeHandler, "function");
  const previousOrigins = [
    "https://istitutojanus.it",
    "https://www.istitutojanus.it",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];
  for (const origin of [...previousOrigins, ...cloudflareOrigins]) {
    const response = await edgeHandler({ method: "OPTIONS", headers: new Headers({ origin }) });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
    assert.equal(response.headers.get("access-control-allow-methods"), "POST, OPTIONS");
    const post = await edgeHandler({ method: "POST", headers: new Headers({ origin }) });
    assert.equal(post.status, 415); // Allowed origin; missing JSON content type is still rejected.
    assert.equal(post.headers.get("access-control-allow-origin"), origin);
  }
  for (const origin of [
    "https://untrusted.example.test",
    "https://gestionale-janus.pages.dev.evil.example.test",
    "https://other.gestionale-janus.pages.dev",
    "https://istitutojanus.it.evil.example.test",
    "http://localhost:5174",
    "null",
    "",
  ]) {
    for (const method of ["OPTIONS", "POST"]) {
      const response = await edgeHandler({ method, headers: new Headers({ origin }) });
      assert.equal(response.status, 403);
      assert.equal(response.headers.get("access-control-allow-origin"), null);
    }
  }
  console.log("CORS: 7 origini ammesse, 7 escluse, 28 richieste simulate; resto della funzione identico alla baseline. Zero rete/database.");
  console.log(
    "Home/form pubblico: due percorsi, stato preservato, validazione, errori e conferma, payload invariato, nessuna iscrizione/account automatico. Solo risposte simulate; zero rete.",
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
