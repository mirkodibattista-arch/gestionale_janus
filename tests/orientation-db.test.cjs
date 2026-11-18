const assert = require("node:assert/strict");
const { readFile, readdir } = require("node:fs/promises");
const { test } = require("node:test");
const { PGlite } = require("@electric-sql/pglite");
const { PGLiteSocketServer } = require("@electric-sql/pglite-socket");
const postgres = require("postgres");

const migrations = "supabase/migrations";
const runbook = "supabase/runbooks/orientation-staging";
const userId = "00000000-0000-4000-8000-000000000001";

test("migrazione, repository PostgreSQL, ruoli e rollback su staging sintetico", async () => {
  const { createReader } = await import("../supabase/functions/richieste-orientamento/repository.ts");
  const db = await PGlite.create();
  let sql;
  let server;
  try {
    const old = await readFile(`${migrations}/20261111140000_crea_richieste_contatto_pubbliche.sql`, "utf8");
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      ${old.split("grant select on table")[0]}
      -- PGlite usa standard_conforming_strings; allineamento della regexp allo schema di staging.
      alter table public.richieste_contatto drop constraint richieste_contatto_email_check;
      alter table public.richieste_contatto add constraint richieste_contatto_email_check check (length(email) <= 254);
      grant insert (nome, cognome, email, telefono, indirizzo_interesse, modalita_interesse,
        messaggio, informativa_letta, versione_informativa, consenso_marketing)
        on public.richieste_contatto to service_role;
    `);
    await db.exec(await readFile(`${runbook}/preflight.sql`, "utf8"));
    const migration = (await readdir(migrations)).find((file) => file.endsWith("_janus_orientation_readonly.sql"));
    const migrationSql = await readFile(`${migrations}/${migration}`, "utf8");

    await db.exec("grant select (id) on public.richieste_contatto to authenticated");
    await assert.rejects(db.exec(migrationSql), /Preflight JANUS/);
    await db.exec("rollback; revoke select (id) on public.richieste_contatto from authenticated");
    await db.exec(migrationSql);

    await db.exec(`
      insert into auth.users values ('${userId}');
      insert into janus_privato.profili_aziendali (utente_id, ruolo) values ('${userId}', 'Admin');
      set role service_role;
      insert into public.richieste_contatto (nome, cognome, email, telefono,
        indirizzo_interesse, modalita_interesse, messaggio, informativa_letta)
      select 'Allievo ' || i, 'Collaudo', 'test' || i || '@example.test', '12345678',
        'Informatica', 'gold_digital', 'Messaggio sintetico', true
      from generate_series(1, 21) i;
      reset role;
      update public.richieste_contatto set stato='contattata' where nome='Allievo 1';
    `);

    for (const role of ["anon", "authenticated", "service_role", "janus_orientation_edge"]) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.query("select id from public.richieste_contatto"), { code: "42501" });
      await assert.rejects(db.query("select ruolo from janus_privato.profili_aziendali"), { code: "42501" });
      await db.exec("reset role");
    }
    await db.exec("set role janus_orientation_reader");
    for (const query of [
      "select consenso_marketing from public.richieste_contatto",
      "update public.richieste_contatto set stato='chiusa'",
      "delete from public.richieste_contatto",
      "update janus_privato.profili_aziendali set attivo=true",
      "select id from auth.users",
    ]) await assert.rejects(db.query(query), { code: "42501" });
    await db.exec("reset role");

    const membership = (await db.query(`select
      pg_has_role('janus_orientation_edge', 'janus_orientation_reader', 'SET') as can_set,
      pg_has_role('janus_orientation_edge', 'janus_orientation_reader', 'USAGE') as can_inherit`)).rows[0];
    assert.deepEqual(membership, { can_set: true, can_inherit: false });

    server = new PGLiteSocketServer({ db, host: "127.0.0.1", port: 0 });
    await server.start();
    sql = postgres(`postgresql://postgres@${server.getServerConn()}/postgres`,
      { max: 1, prepare: false, fetch_types: false, connect_timeout: 3 });
    // La connessione di test si impersona come ruolo tecnico senza abilitarne il LOGIN.
    await sql`set role janus_orientation_edge`;
    const read = createReader(sql);
    assert.equal(await read((reader) => reader.profile(userId)), null);
    await sql`reset role`;
    await sql`update janus_privato.profili_aziendali set attivo=true where utente_id=${userId}::uuid`;
    await sql`set role janus_orientation_edge`;
    const [identity] = await sql`select current_user as role`;
    assert.equal(identity.role, "janus_orientation_edge");
    const filters = { search: "", status: "", modality: "", page: 1 };
    const data = await read(async (reader) => {
      assert.equal((await reader.profile(userId)).role, "Admin");
      return reader.list(filters);
    });
    assert.equal(data.total, 21);
    assert.equal(data.items.length, 20);
    assert.deepEqual({ ...data.counts }, { nuova: 20, contattata: 1, in_valutazione: 0, chiusa: 0 });
    assert.equal(Object.hasOwn(data.items[0], "messaggio"), false);
    const next = await read((reader) => reader.list({ ...filters, page: 2 }));
    assert.equal(next.items.length, 1);
    assert.ok(!data.items.some((row) => row.id === next.items[0].id));
    const filtered = await read((reader) => reader.list({
      ...filters, search: "ALLIEVO", status: "contattata", modality: "gold_digital",
    }));
    assert.equal(filtered.total, 1);
    assert.equal(filtered.items[0].nome, "Allievo 1");
    const details = await read((reader) => reader.detail(filtered.items[0].id));
    assert.equal(details.messaggio, "Messaggio sintetico");
    const literal = await read((reader) => reader.list({ ...filters, search: "%_" }));
    assert.equal(literal.total, 0);
    const [endingIdentity] = await sql`select current_user as role`;
    assert.equal(endingIdentity.role, "janus_orientation_edge");
    await sql`reset role`;
    await sql.end({ timeout: 1 });
    sql = undefined;
    await server.stop();
    server = undefined;

    await db.exec(await readFile(`${runbook}/rollback.sql`, "utf8"));
    assert.equal((await db.query("select count(*)::int n from public.richieste_contatto")).rows[0].n, 21);
    assert.equal((await db.query("select count(*)::int n from janus_privato.profili_aziendali")).rows[0].n, 1);
    const revoked = (await db.query(`select
      pg_has_role('janus_orientation_edge', 'janus_orientation_reader', 'SET') as can_set`)).rows[0];
    assert.equal(revoked.can_set, false);
    await db.exec("set role service_role");
    await db.exec(`insert into public.richieste_contatto (nome, cognome, email, telefono, informativa_letta)
      values ('Ultimo', 'Collaudo', 'test@example.test', '12345678', true)`);
    await db.exec("reset role");
  } finally {
    if (sql) await sql.end({ timeout: 1 });
    if (server) await server.stop();
    await db.close();
  }
});
