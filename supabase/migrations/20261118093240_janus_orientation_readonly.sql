-- JANUS staging rwaotjfhiyhndlgljuuo, sola lettura.
-- Verificare il progetto nel Dashboard prima di eseguire. Questa migrazione
-- non attiva il LOGIN tecnico e non crea o associa profili.
begin;

do $$
begin
  if not (select relrowsecurity from pg_class where oid = 'public.richieste_contatto'::regclass)
    or exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'richieste_contatto'
    )
    or exists (
      select 1 from unnest(array['anon', 'authenticated']::name[]) as roles(rolname)
      where has_any_column_privilege(rolname, 'public.richieste_contatto', 'SELECT, INSERT, UPDATE')
        or has_table_privilege(rolname, 'public.richieste_contatto', 'DELETE, TRUNCATE')
    )
    or not has_any_column_privilege('service_role', 'public.richieste_contatto', 'INSERT')
  then
    raise exception 'Preflight JANUS: privilegi o policy diversi dalla baseline staging.';
  end if;
end;
$$;

create schema janus_privato;
revoke all on schema janus_privato from public, anon, authenticated;

create role janus_orientation_reader
  nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;

-- L'identità di connessione nasce disabilitata e non eredita i grant del reader.
create role janus_orientation_edge
  nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls
  connection limit 6;
grant janus_orientation_reader to janus_orientation_edge with inherit false, set true;
alter role janus_orientation_edge set default_transaction_read_only = on;
alter role janus_orientation_edge set statement_timeout = '3s';
alter role janus_orientation_edge set idle_in_transaction_session_timeout = '5s';

create table janus_privato.profili_aziendali (
  utente_id uuid primary key references auth.users(id) on delete cascade,
  ruolo text not null check (
    ruolo in ('Admin', 'Supervisore', 'Segreteria', 'Didattica',
              'Amministrazione', 'Tutor', 'Audit')
  ),
  attivo boolean not null default false,
  creato_il timestamptz not null default now()
);
revoke all on janus_privato.profili_aziendali from public, anon, authenticated;
alter table janus_privato.profili_aziendali enable row level security;

grant usage on schema janus_privato, public to janus_orientation_reader;
grant select (utente_id, ruolo, attivo)
  on janus_privato.profili_aziendali to janus_orientation_reader;
create policy janus_orientation_reader_profili
  on janus_privato.profili_aziendali for select to janus_orientation_reader using (true);

grant select (id, nome, cognome, email, telefono, indirizzo_interesse,
  modalita_interesse, messaggio, stato, ricevuta_il)
  on public.richieste_contatto to janus_orientation_reader;
create policy janus_orientation_reader_richieste
  on public.richieste_contatto for select to janus_orientation_reader using (true);

commit;
