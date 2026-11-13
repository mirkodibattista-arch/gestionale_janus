/* Regressione della pagina pubblica (dashboard evolute in verify-auth.cjs): confronta il markup con il commit iniziale.
 * Usa render statico e un client Supabase fittizio: nessun servizio esterno.
 * Non sostituisce una verifica interattiva nel browser.
 */
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const root = path.resolve(__dirname, "..");
const baseline = "466c2bd3c4fd6a7bc5c2d97001ce828cd6107832";
const oldSource = execFileSync("git", ["show", `${baseline}:src/App.tsx`], {
  cwd: root,
  encoding: "utf8",
});
let states = [];
let cursor = 0;
const reactShim = {
  ...React,
  useState(initial) {
    const value =
      cursor < states.length
        ? states[cursor]
        : typeof initial === "function"
          ? initial()
          : initial;
    cursor += 1;
    return [value, () => {}];
  },
};
let networkCalls = 0;
const fakeSupabase = {
  supabase: {
    functions: {
      invoke() {
        networkCalls += 1;
        throw new Error("Network forbidden during regression check");
      },
    },
  },
};
const cache = new Map();
function load(file, sourceOverride) {
  if (!sourceOverride && cache.has(file)) return cache.get(file);
  const source = sourceOverride || fs.readFileSync(file, "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  function localRequire(id) {
    if (id === "react") return reactShim;
    if (!id.startsWith(".")) return require(id);
    const candidate = path.resolve(path.dirname(file), id);
    if (candidate.endsWith("/src/lib/supabase")) return fakeSupabase;
    const resolved = [".tsx", ".ts", ".js"]
      .map((ext) => candidate + ext)
      .find((f) => fs.existsSync(f));
    if (!resolved) throw new Error(`Unresolved local module: ${id}`);
    return load(resolved);
  }
  new Function("require", "module", "exports", code)(
    localRequire,
    module,
    module.exports,
  );
  if (!sourceOverride) cache.set(file, module.exports);
  return module.exports;
}
const oldApp = load(
  path.join(root, "src/App.tsx"),
  oldSource + "\nexport { DashboardDemo };",
);
const { OrientationPage } = load(
  path.join(root, "src/pages/OrientationPage.tsx"),
);
const { useOrientationForm } = load(
  path.join(root, "src/modules/orientation/hooks/useOrientationForm.ts"),
);
function CurrentOrientation() {
  reactShim.useState("form"); // stato di navigazione della baseline
  return React.createElement(OrientationPage, {
    controller: useOrientationForm(),
    onDashboard() {},
  });
}
function render(Component, state, props = {}) {
  states = state;
  cursor = 0;
  return renderToStaticMarkup(React.createElement(Component, props))
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}
const form = {
  nome: "Persona",
  cognome: "Demo",
  email: "persona@example.test",
  telefono: "+39 000 000000",
  indirizzo_interesse: "Liceo Scientifico",
  modalita_interesse: "gold_digital",
  messaggio: "Prova fittizia",
  informativa_letta: true,
  consenso_marketing: false,
  website: "",
};
function assertMarkup(actual, expected, label) {
  if (actual !== expected) {
    let index = 0;
    while (actual[index] === expected[index]) index++;
    throw new Error(
      `${label}: differenza a ${index}\nnuovo: ${actual.slice(index - 70, index + 100)}\nprima: ${expected.slice(index - 70, index + 100)}`,
    );
  }
}
let checks = 0;
for (const [step, busy, error, success] of [
  [1, false, "", false],
  [2, false, "", false],
  [3, false, "", false],
  [3, true, "", false],
  [1, false, "Errore dimostrativo", false],
  [3, false, "", true],
]) {
  const state = ["form", step, form, busy, error, success];
  assertMarkup(
    render(CurrentOrientation, state).replace(
      "Accedi al campus",
      "Anteprima gestionale",
    ),
    render(oldApp.default, state),
    `Public form: step ${step}, busy=${busy}, error=${error}, success=${success}`,
  );
  checks += 1;
}
assert.equal(networkCalls, 0);
console.log(
  `${checks} confronti di markup superati; nessuna chiamata Supabase.`,
);
