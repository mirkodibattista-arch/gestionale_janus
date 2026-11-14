// Verifiche della sessione demo e delle regole di navigazione; nessuna rete.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const result = { exports: {} };
  new Function("require", "module", "exports", code)(
    (id) =>
      id.startsWith(".")
        ? load(path.resolve(path.dirname(file), id + ".ts"))
        : require(id),
    result,
    result.exports,
  );
  cache.set(file, result.exports);
  return result.exports;
}
const base = path.resolve(__dirname, "../src");
const { createDemoAuthService, DEMO_SESSION_KEY, DEMO_SESSION_DURATION } = load(
  path.join(base, "modules/auth/demoAuthService.ts"),
);
const DEMO_PASSWORD = "CampusDemo!2026";
const { demoAccounts } = load(path.join(base, "modules/auth/demoAccounts.ts"));
const { canAccessModule, parseRoute, roleModules } = load(
  path.join(base, "routing/routes.ts"),
);
const { roles } = load(path.join(base, "types/roles.ts"));
let raw = null;
let now = 100000000;
const storage = {
  getItem: () => raw,
  setItem: (_, value) => {
    raw = value;
  },
  removeItem: () => {
    raw = null;
  },
};
const auth = createDemoAuthService(storage, () => now);
(async () => {
  assert.deepEqual(new Set(demoAccounts.map((a) => a.role)), new Set(roles));
  for (const account of demoAccounts) {
    const session = await auth.signIn(
      `  ${account.email.toUpperCase()}  `,
      DEMO_PASSWORD,
    );
    assert.equal(session.role, account.role);
    assert.equal(session.user.id, account.id);
    assert.equal(auth.getSession().role, account.role);
    assert.ok(!raw.includes(DEMO_PASSWORD));
    assert.ok(!raw.includes("password"));
    assert.ok(canAccessModule(account.role, "dashboard"));
    for (const id of roleModules[account.role])
      assert.ok(canAccessModule(account.role, id));
    // Un campo ruolo aggiunto al JSON non cambia il ruolo risolto dall'account.
    raw = JSON.stringify({
      ...JSON.parse(raw),
      role: "Admin",
      scope: { studentId: "ST-999", tutorId: "TU-999" },
    });
    assert.equal(auth.getSession().role, account.role);
    assert.deepEqual(auth.getSession().scope, account.scope);
    auth.signOut();
    assert.equal(auth.getSession(), null);
  }
  await assert.rejects(
    auth.signIn("studente@janus-demo.test", "wrong"),
    /non corretti/,
  );
  await assert.rejects(
    auth.signIn("admin-falso@janus-demo.test", DEMO_PASSWORD),
    /non corretti/,
  );
  const account = demoAccounts[0];
  account.active = false;
  try {
    await assert.rejects(
      auth.signIn(account.email, DEMO_PASSWORD),
      /non attivo/,
    );
  } finally {
    account.active = true;
  }
  await auth.signIn(demoAccounts[6].email, DEMO_PASSWORD);
  now += DEMO_SESSION_DURATION;
  assert.equal(auth.getSession(), null);
  assert.equal(raw, null);
  for (const invalid of [
    "broken",
    "null",
    "{}",
    JSON.stringify({ version: 1, accountId: "unknown", issuedAt: now }),
    JSON.stringify({ version: 1, accountId: "demo-01", issuedAt: now + 1000 }),
    JSON.stringify({ version: 2, accountId: "demo-01", issuedAt: now }),
  ]) {
    raw = invalid;
    assert.equal(auth.getSession(), null);
    assert.equal(raw, null);
  }
  const blocked = createDemoAuthService({
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("blocked");
    },
    removeItem() {
      throw Error("blocked");
    },
  });
  assert.equal(blocked.getSession(), null);
  await assert.rejects(
    blocked.signIn(account.email, DEMO_PASSWORD),
    /archiviazione/,
  );
  blocked.signOut();
  for (const role of ["Studente", "Tutor", "Segreteria"])
    assert.equal(canAccessModule(role, "amministrazione"), false);
  assert.equal(canAccessModule("Tutor", "segreteria"), false);
  assert.equal(canAccessModule("Studente", "studenti"), false);
  assert.equal(canAccessModule("Studente", "__proto__"), false);
  assert.equal(canAccessModule("Admin", "amministrazione"), true);
  assert.equal(
    parseRoute("#/campus/amministrazione").moduleId,
    "amministrazione",
  );
  assert.equal(parseRoute("#/campus/a/b").page, "not-found");
  assert.equal(parseRoute("#/studente/profilo").portal, "studente");
  assert.equal(parseRoute("#/azienda/dashboard").portal, "azienda");
  assert.equal(parseRoute("#/studente/profilo/ST-002").page, "not-found");
  for (const id of ["materie", "comunicazioni", "avanzamento"])
    assert.ok(canAccessModule("Studente", id));
  assert.equal(parseRoute("#richiesta").page, "home");
  assert.deepEqual(parseRoute("/"), { page: "home" });
  assert.deepEqual(parseRoute("/orientamento"), { page: "orientation" });
  assert.deepEqual(parseRoute("/login"), { page: "login" });
  assert.deepEqual(parseRoute("/campus/dashboard"), {
    page: "campus",
    portal: "azienda",
    moduleId: "dashboard",
  });
  assert.deepEqual(parseRoute("/campus/studente"), {
    page: "campus",
    portal: "studente",
    moduleId: "dashboard",
  });
  assert.deepEqual(parseRoute("/campus/studente/profilo"), {
    page: "campus",
    portal: "studente",
    moduleId: "profilo",
  });
  assert.equal(parseRoute("/campus/studente/profilo/ST-002").page, "not-found");
  console.log(
    "Auth demo: 8 account, associazioni ruolo, sessione/expiry/logout, storage corrotto/bloccato e accessi consentiti/negati verificati.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
