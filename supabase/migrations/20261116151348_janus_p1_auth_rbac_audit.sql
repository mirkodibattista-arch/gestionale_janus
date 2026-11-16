-- JANUS P1: proposal only. Do not run without explicit staging approval.
-- Run on a single dedicated connection. Gate is an operator acknowledgement,
-- not automatic server identity detection; verify the endpoint independently.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
DO $guard$
BEGIN
 IF current_setting('janus.approved_project',true) IS DISTINCT FROM 'rwaotjfhiyhndlgljuuo' THEN
  RAISE EXCEPTION 'Set janus.approved_project to the approved staging ref on this connection';
 END IF;
 IF to_regclass('private.janus_p1_version') IS NULL AND (
  to_regclass('public.profili') IS NOT NULL OR to_regclass('private.ruoli') IS NOT NULL OR
  to_regclass('private.permessi') IS NOT NULL OR to_regclass('private.ruoli_permessi') IS NOT NULL OR
  to_regclass('private.utenti_ruoli') IS NOT NULL OR to_regclass('private.eventi_audit') IS NOT NULL
 ) THEN RAISE EXCEPTION 'Unexpected pre-existing auth objects: inspect, do not overwrite'; END IF;
END $guard$;
CREATE SCHEMA IF NOT EXISTS private;
CREATE TABLE IF NOT EXISTS private.janus_p1_version(version integer PRIMARY KEY CHECK(version=1));
INSERT INTO private.janus_p1_version VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS public.profili (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
 nome text NOT NULL CHECK(length(trim(nome)) BETWEEN 1 AND 120),
 attivo boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS private.ruoli (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), codice text NOT NULL UNIQUE,
 nome text NOT NULL
);
CREATE TABLE IF NOT EXISTS private.permessi (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), risorsa text NOT NULL,
 azione text NOT NULL CHECK(azione IN ('lettura','creazione','modifica','conferma','export','gestione')),
 ambito text NOT NULL CHECK(ambito IN ('tutti','propri','assegnati')),
 UNIQUE(risorsa,azione,ambito)
);
CREATE TABLE IF NOT EXISTS private.ruoli_permessi (
 ruolo_id uuid NOT NULL REFERENCES private.ruoli(id) ON DELETE RESTRICT,
 permesso_id uuid NOT NULL REFERENCES private.permessi(id) ON DELETE RESTRICT,
 PRIMARY KEY(ruolo_id,permesso_id)
);
CREATE TABLE IF NOT EXISTS private.utenti_ruoli (
 user_id uuid NOT NULL REFERENCES public.profili(user_id) ON DELETE RESTRICT,
 ruolo_id uuid NOT NULL REFERENCES private.ruoli(id) ON DELETE RESTRICT,
 PRIMARY KEY(user_id,ruolo_id)
);
CREATE TABLE IF NOT EXISTS private.eventi_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), attore uuid,
 azione text NOT NULL CHECK(azione IN ('INSERT','UPDATE','DELETE','READ')),
 risorsa text NOT NULL, id_record text, data timestamptz NOT NULL DEFAULT now(),
 esito text NOT NULL DEFAULT 'ok' CHECK(esito='ok')
);
CREATE INDEX IF NOT EXISTS p1_ruoli_permessi_permesso_idx ON private.ruoli_permessi(permesso_id);
CREATE INDEX IF NOT EXISTS p1_utenti_ruoli_ruolo_idx ON private.utenti_ruoli(ruolo_id);
CREATE INDEX IF NOT EXISTS p1_audit_data_idx ON private.eventi_audit(data DESC,id);
-- Non-public schema, no client table mutation privileges; RLS defense in depth.
REVOKE ALL ON SCHEMA private FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SCHEMA private TO authenticated;
ALTER TABLE public.profili ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.profili FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE private.ruoli ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.ruoli FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE private.permessi ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.permessi FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE private.ruoli_permessi ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.ruoli_permessi FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE private.utenti_ruoli ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.utenti_ruoli FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE private.eventi_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.eventi_audit FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE private.janus_p1_version ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.janus_p1_version FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.profili TO authenticated;
-- The private lookup is intentionally SECURITY DEFINER to avoid recursive RLS.
-- Caller identity is always auth.uid(), never a caller supplied user ID.
CREATE OR REPLACE FUNCTION private.p1_ha_permesso(r text,a text,s text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $fn$
 SELECT auth.uid() IS NOT NULL AND EXISTS (
 SELECT 1 FROM public.profili p JOIN auth.users au ON au.id=p.user_id
 WHERE p.user_id=auth.uid() AND p.attivo AND au.email_confirmed_at IS NOT NULL
 AND NOT au.is_anonymous AND (au.banned_until IS NULL OR au.banned_until<=now())
 ) AND EXISTS (
 SELECT 1 FROM private.utenti_ruoli u JOIN private.ruoli_permessi rp ON rp.ruolo_id=u.ruolo_id
 JOIN private.permessi pe ON pe.id=rp.permesso_id
 WHERE u.user_id=auth.uid() AND pe.risorsa=r AND pe.azione=a AND pe.ambito=s
 );
$fn$;
REVOKE ALL ON FUNCTION private.p1_ha_permesso(text,text,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION private.p1_ha_permesso(text,text,text) TO authenticated;
DROP POLICY IF EXISTS p1_profili_lettura ON public.profili;
CREATE POLICY p1_profili_lettura ON public.profili FOR SELECT TO authenticated USING (
 (user_id=(SELECT auth.uid()) AND (SELECT private.p1_ha_permesso('profili','lettura','propri')))
 OR (SELECT private.p1_ha_permesso('profili','lettura','tutti'))
);
-- No profile UPDATE/INSERT/DELETE policy: management only through guarded RPC.
CREATE OR REPLACE FUNCTION private.p1_audit_modifica()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE j jsonb; record_key text;
BEGIN
 IF TG_OP='DELETE' THEN j=to_jsonb(OLD); ELSE j=to_jsonb(NEW); END IF;
 -- Only technical keys are persisted. No row snapshot, name, email, IP, JWT or free text.
 record_key=CASE TG_TABLE_NAME
  WHEN 'utenti_ruoli' THEN (j->>'user_id')||':'||(j->>'ruolo_id')
  WHEN 'ruoli_permessi' THEN (j->>'ruolo_id')||':'||(j->>'permesso_id')
  WHEN 'profili' THEN j->>'user_id' ELSE coalesce(j->>'id',j->>'studente_id') END;
 INSERT INTO private.eventi_audit(attore,azione,risorsa,id_record)
 VALUES(auth.uid(),TG_OP,TG_TABLE_SCHEMA||'.'||TG_TABLE_NAME,record_key);
 IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW;
END $fn$;
REVOKE ALL ON FUNCTION private.p1_audit_modifica() FROM PUBLIC,anon,authenticated,service_role;
DROP TRIGGER IF EXISTS p1_audit ON public.profili;
CREATE TRIGGER p1_audit AFTER INSERT OR UPDATE OR DELETE ON public.profili FOR EACH ROW EXECUTE FUNCTION private.p1_audit_modifica();
DROP TRIGGER IF EXISTS p1_audit ON private.ruoli;
CREATE TRIGGER p1_audit AFTER INSERT OR UPDATE OR DELETE ON private.ruoli FOR EACH ROW EXECUTE FUNCTION private.p1_audit_modifica();
DROP TRIGGER IF EXISTS p1_audit ON private.permessi;
CREATE TRIGGER p1_audit AFTER INSERT OR UPDATE OR DELETE ON private.permessi FOR EACH ROW EXECUTE FUNCTION private.p1_audit_modifica();
DROP TRIGGER IF EXISTS p1_audit ON private.ruoli_permessi;
CREATE TRIGGER p1_audit AFTER INSERT OR UPDATE OR DELETE ON private.ruoli_permessi FOR EACH ROW EXECUTE FUNCTION private.p1_audit_modifica();
DROP TRIGGER IF EXISTS p1_audit ON private.utenti_ruoli;
CREATE TRIGGER p1_audit AFTER INSERT OR UPDATE OR DELETE ON private.utenti_ruoli FOR EACH ROW EXECUTE FUNCTION private.p1_audit_modifica();
DROP TRIGGER IF EXISTS p1_audit ON public.studenti;
CREATE TRIGGER p1_audit AFTER INSERT OR UPDATE OR DELETE ON public.studenti FOR EACH ROW EXECUTE FUNCTION private.p1_audit_modifica();
DROP TRIGGER IF EXISTS p1_audit ON public.studenti_dati_personali;
CREATE TRIGGER p1_audit AFTER INSERT OR UPDATE OR DELETE ON public.studenti_dati_personali FOR EACH ROW EXECUTE FUNCTION private.p1_audit_modifica();
DROP TRIGGER IF EXISTS p1_audit ON public.referenti;
CREATE TRIGGER p1_audit AFTER INSERT OR UPDATE OR DELETE ON public.referenti FOR EACH ROW EXECUTE FUNCTION private.p1_audit_modifica();
DROP TRIGGER IF EXISTS p1_audit ON public.studenti_referenti;
CREATE TRIGGER p1_audit AFTER INSERT OR UPDATE OR DELETE ON public.studenti_referenti FOR EACH ROW EXECUTE FUNCTION private.p1_audit_modifica();
DROP TRIGGER IF EXISTS p1_audit ON public.richieste_contatto;
CREATE TRIGGER p1_audit AFTER INSERT OR UPDATE OR DELETE ON public.richieste_contatto FOR EACH ROW EXECUTE FUNCTION private.p1_audit_modifica();
INSERT INTO private.ruoli(codice,nome) VALUES
('admin','Admin'),
('supervisore','Supervisore'),
('segreteria','Segreteria'),
('didattica','Didattica'),
('amministrazione','Amministrazione'),
('tutor','Tutor'),
('audit','Audit'),
('studente','Studente')
ON CONFLICT(codice) DO NOTHING;
INSERT INTO private.permessi(risorsa,azione,ambito) VALUES
('accessi','gestione','tutti'),
('assegnazioni','creazione','tutti'),
('assegnazioni','lettura','tutti'),
('assegnazioni','modifica','tutti'),
('audit','lettura','tutti'),
('contabilita','creazione','tutti'),
('contabilita','lettura','propri'),
('contabilita','lettura','tutti'),
('contabilita','modifica','tutti'),
('dati_personali','creazione','tutti'),
('dati_personali','lettura','tutti'),
('dati_personali','modifica','tutti'),
('documenti','creazione','tutti'),
('documenti','lettura','propri'),
('documenti','lettura','tutti'),
('documenti','modifica','tutti'),
('esami','creazione','tutti'),
('esami','lettura','propri'),
('esami','lettura','tutti'),
('esami','modifica','tutti'),
('iscrizioni','creazione','tutti'),
('iscrizioni','lettura','tutti'),
('iscrizioni','modifica','tutti'),
('orientamento','conferma','tutti'),
('orientamento','lettura','tutti'),
('orientamento','modifica','tutti'),
('piani','creazione','tutti'),
('piani','lettura','assegnati'),
('piani','lettura','propri'),
('piani','lettura','tutti'),
('piani','modifica','assegnati'),
('piani','modifica','tutti'),
('profili','gestione','tutti'),
('profili','lettura','propri'),
('profili','lettura','tutti'),
('referenti','creazione','tutti'),
('referenti','lettura','tutti'),
('referenti','modifica','tutti'),
('studenti','creazione','tutti'),
('studenti','lettura','assegnati'),
('studenti','lettura','propri'),
('studenti','lettura','tutti'),
('studenti','modifica','tutti'),
('tutor','creazione','tutti'),
('tutor','lettura','tutti'),
('tutor','modifica','tutti')
ON CONFLICT(risorsa,azione,ambito) DO NOTHING;
-- Initial role matrix is seeded once. Re-running preserves later approved changes.
DO $seed$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_description WHERE objoid='private.janus_p1_version'::regclass AND description='JANUS P1 seeded v1') THEN
 INSERT INTO private.ruoli_permessi(ruolo_id,permesso_id)
 SELECT r.id,p.id FROM (VALUES
('admin','accessi','gestione','tutti'),
('admin','assegnazioni','creazione','tutti'),
('admin','assegnazioni','lettura','tutti'),
('admin','assegnazioni','modifica','tutti'),
('admin','audit','lettura','tutti'),
('admin','contabilita','creazione','tutti'),
('admin','contabilita','lettura','tutti'),
('admin','contabilita','modifica','tutti'),
('admin','dati_personali','creazione','tutti'),
('admin','dati_personali','lettura','tutti'),
('admin','dati_personali','modifica','tutti'),
('admin','documenti','creazione','tutti'),
('admin','documenti','lettura','tutti'),
('admin','documenti','modifica','tutti'),
('admin','esami','creazione','tutti'),
('admin','esami','lettura','tutti'),
('admin','esami','modifica','tutti'),
('admin','iscrizioni','creazione','tutti'),
('admin','iscrizioni','lettura','tutti'),
('admin','iscrizioni','modifica','tutti'),
('admin','orientamento','conferma','tutti'),
('admin','orientamento','lettura','tutti'),
('admin','orientamento','modifica','tutti'),
('admin','piani','creazione','tutti'),
('admin','piani','lettura','tutti'),
('admin','piani','modifica','tutti'),
('admin','profili','gestione','tutti'),
('admin','profili','lettura','propri'),
('admin','profili','lettura','tutti'),
('admin','referenti','creazione','tutti'),
('admin','referenti','lettura','tutti'),
('admin','referenti','modifica','tutti'),
('admin','studenti','creazione','tutti'),
('admin','studenti','lettura','tutti'),
('admin','studenti','modifica','tutti'),
('admin','tutor','creazione','tutti'),
('admin','tutor','lettura','tutti'),
('admin','tutor','modifica','tutti'),
('supervisore','assegnazioni','lettura','tutti'),
('supervisore','dati_personali','lettura','tutti'),
('supervisore','documenti','lettura','tutti'),
('supervisore','esami','lettura','tutti'),
('supervisore','iscrizioni','lettura','tutti'),
('supervisore','piani','lettura','tutti'),
('supervisore','profili','lettura','propri'),
('supervisore','referenti','lettura','tutti'),
('supervisore','studenti','lettura','tutti'),
('supervisore','tutor','lettura','tutti'),
('segreteria','dati_personali','creazione','tutti'),
('segreteria','dati_personali','lettura','tutti'),
('segreteria','dati_personali','modifica','tutti'),
('segreteria','documenti','creazione','tutti'),
('segreteria','documenti','lettura','tutti'),
('segreteria','documenti','modifica','tutti'),
('segreteria','iscrizioni','creazione','tutti'),
('segreteria','iscrizioni','lettura','tutti'),
('segreteria','iscrizioni','modifica','tutti'),
('segreteria','orientamento','conferma','tutti'),
('segreteria','orientamento','lettura','tutti'),
('segreteria','orientamento','modifica','tutti'),
('segreteria','profili','lettura','propri'),
('segreteria','referenti','creazione','tutti'),
('segreteria','referenti','lettura','tutti'),
('segreteria','referenti','modifica','tutti'),
('segreteria','studenti','creazione','tutti'),
('segreteria','studenti','lettura','tutti'),
('segreteria','studenti','modifica','tutti'),
('didattica','assegnazioni','creazione','tutti'),
('didattica','assegnazioni','lettura','tutti'),
('didattica','assegnazioni','modifica','tutti'),
('didattica','esami','creazione','tutti'),
('didattica','esami','lettura','tutti'),
('didattica','esami','modifica','tutti'),
('didattica','piani','creazione','tutti'),
('didattica','piani','lettura','tutti'),
('didattica','piani','modifica','tutti'),
('didattica','profili','lettura','propri'),
('didattica','studenti','lettura','tutti'),
('didattica','tutor','creazione','tutti'),
('didattica','tutor','lettura','tutti'),
('didattica','tutor','modifica','tutti'),
('amministrazione','contabilita','creazione','tutti'),
('amministrazione','contabilita','lettura','tutti'),
('amministrazione','contabilita','modifica','tutti'),
('amministrazione','profili','lettura','propri'),
('amministrazione','studenti','lettura','tutti'),
('tutor','piani','lettura','assegnati'),
('tutor','piani','modifica','assegnati'),
('tutor','profili','lettura','propri'),
('tutor','studenti','lettura','assegnati'),
('audit','audit','lettura','tutti'),
('audit','profili','lettura','propri'),
('studente','contabilita','lettura','propri'),
('studente','documenti','lettura','propri'),
('studente','esami','lettura','propri'),
('studente','piani','lettura','propri'),
('studente','profili','lettura','propri'),
('studente','studenti','lettura','propri')
 ) AS m(codice,risorsa,azione,ambito)
 JOIN private.ruoli r ON r.codice=m.codice
 JOIN private.permessi p ON (p.risorsa,p.azione,p.ambito)=(m.risorsa,m.azione,m.ambito)
 ON CONFLICT DO NOTHING;
 COMMENT ON TABLE private.janus_p1_version IS 'JANUS P1 seeded v1';
 END IF;
END $seed$;
CREATE OR REPLACE FUNCTION private.p1_richiedi_admin()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
BEGIN
 IF NOT private.p1_ha_permesso('accessi','gestione','tutti') OR
 coalesce(auth.jwt()->>'aal','')<>'aal2' THEN
 RAISE EXCEPTION 'Admin attivo con MFA richiesto' USING ERRCODE='42501'; END IF;
END $fn$;
REVOKE ALL ON FUNCTION private.p1_richiedi_admin() FROM PUBLIC,anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION private.p1_gestisci_ruolo(utente uuid,codice_ruolo text,assegna boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE rid uuid;
BEGIN
 IF assegna IS NULL OR utente IS NULL THEN RAISE EXCEPTION 'Parametri obbligatori'; END IF;
 PERFORM pg_advisory_xact_lock(770012);
 PERFORM private.p1_richiedi_admin();
 SELECT id INTO rid FROM private.ruoli WHERE codice=codice_ruolo;
 IF rid IS NULL OR NOT EXISTS(SELECT 1 FROM public.profili WHERE user_id=utente AND attivo) THEN
 RAISE EXCEPTION 'Ruolo o profilo attivo inesistente'; END IF;
 IF NOT assegna AND codice_ruolo='admin' AND EXISTS(
 SELECT 1 FROM private.utenti_ruoli WHERE user_id=utente AND ruolo_id=rid) AND (
 SELECT count(*) FROM private.utenti_ruoli ur JOIN public.profili p ON p.user_id=ur.user_id
 WHERE ur.ruolo_id=rid AND p.attivo)<=1 THEN
 RAISE EXCEPTION 'Non rimuovere ultimo Admin attivo' USING ERRCODE='42501'; END IF;
 IF assegna THEN INSERT INTO private.utenti_ruoli VALUES(utente,rid) ON CONFLICT DO NOTHING;
 ELSE DELETE FROM private.utenti_ruoli WHERE user_id=utente AND ruolo_id=rid; END IF;
END $fn$;
CREATE OR REPLACE FUNCTION private.p1_imposta_profilo_attivo(utente uuid,abilitato boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
BEGIN
 IF abilitato IS NULL THEN RAISE EXCEPTION 'Stato obbligatorio'; END IF;
 PERFORM pg_advisory_xact_lock(770012);
 PERFORM private.p1_richiedi_admin();
 IF NOT abilitato AND EXISTS(SELECT 1 FROM private.utenti_ruoli u JOIN private.ruoli r ON r.id=u.ruolo_id
 WHERE u.user_id=utente AND r.codice='admin') AND
 (SELECT count(*) FROM private.utenti_ruoli u JOIN private.ruoli r ON r.id=u.ruolo_id
 JOIN public.profili p ON p.user_id=u.user_id WHERE r.codice='admin' AND p.attivo AND p.user_id<>utente)=0 THEN
 RAISE EXCEPTION 'Non disattivare ultimo Admin attivo' USING ERRCODE='42501'; END IF;
 UPDATE public.profili SET attivo=abilitato WHERE user_id=utente AND attivo IS DISTINCT FROM abilitato;
END $fn$;
CREATE OR REPLACE FUNCTION private.p1_miei_permessi()
RETURNS TABLE(risorsa text,azione text,ambito text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $fn$
 SELECT DISTINCT pe.risorsa,pe.azione,pe.ambito FROM private.utenti_ruoli u
 JOIN private.ruoli_permessi rp ON rp.ruolo_id=u.ruolo_id
 JOIN private.permessi pe ON pe.id=rp.permesso_id
 WHERE u.user_id=auth.uid() AND private.p1_ha_permesso(pe.risorsa,pe.azione,pe.ambito);
$fn$;
CREATE OR REPLACE FUNCTION private.p1_miei_ruoli()
RETURNS TABLE(codice text,nome text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $fn$
 SELECT r.codice,r.nome FROM private.ruoli r JOIN private.utenti_ruoli u ON u.ruolo_id=r.id
 WHERE u.user_id=auth.uid() AND private.p1_ha_permesso('profili','lettura','propri');
$fn$;
CREATE OR REPLACE FUNCTION private.p1_leggi_audit(prima_di timestamptz,prima_id uuid,limite integer)
RETURNS SETOF private.eventi_audit LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
BEGIN
 IF NOT private.p1_ha_permesso('audit','lettura','tutti') OR coalesce(auth.jwt()->>'aal','')<>'aal2' THEN
 RAISE EXCEPTION 'Lettura audit non autorizzata o MFA mancante' USING ERRCODE='42501'; END IF;
 IF limite IS NULL OR limite NOT BETWEEN 1 AND 200 OR prima_di IS NULL OR prima_id IS NULL THEN
 RAISE EXCEPTION 'Paginazione obbligatoria, massimo 200'; END IF;
 INSERT INTO private.eventi_audit(attore,azione,risorsa) VALUES(auth.uid(),'READ','private.eventi_audit');
 RETURN QUERY SELECT e.* FROM private.eventi_audit e WHERE (e.data,e.id)<(prima_di,prima_id) ORDER BY e.data DESC,e.id LIMIT limite;
END $fn$;
REVOKE ALL ON FUNCTION private.p1_gestisci_ruolo(uuid,text,boolean) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION private.p1_gestisci_ruolo(uuid,text,boolean) TO authenticated;
CREATE OR REPLACE FUNCTION public.p1_gestisci_ruolo(utente uuid,codice_ruolo text,assegna boolean) RETURNS void
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $fn$
 SELECT private.p1_gestisci_ruolo(utente,codice_ruolo,assegna);
$fn$;
REVOKE ALL ON FUNCTION public.p1_gestisci_ruolo(uuid,text,boolean) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.p1_gestisci_ruolo(uuid,text,boolean) TO authenticated;
REVOKE ALL ON FUNCTION private.p1_imposta_profilo_attivo(uuid,boolean) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION private.p1_imposta_profilo_attivo(uuid,boolean) TO authenticated;
CREATE OR REPLACE FUNCTION public.p1_imposta_profilo_attivo(utente uuid,abilitato boolean) RETURNS void
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $fn$
 SELECT private.p1_imposta_profilo_attivo(utente,abilitato);
$fn$;
REVOKE ALL ON FUNCTION public.p1_imposta_profilo_attivo(uuid,boolean) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.p1_imposta_profilo_attivo(uuid,boolean) TO authenticated;
REVOKE ALL ON FUNCTION private.p1_miei_permessi() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION private.p1_miei_permessi() TO authenticated;
CREATE OR REPLACE FUNCTION public.p1_miei_permessi() RETURNS TABLE(risorsa text,azione text,ambito text)
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $fn$
 SELECT * FROM private.p1_miei_permessi();
$fn$;
REVOKE ALL ON FUNCTION public.p1_miei_permessi() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.p1_miei_permessi() TO authenticated;
REVOKE ALL ON FUNCTION private.p1_miei_ruoli() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION private.p1_miei_ruoli() TO authenticated;
CREATE OR REPLACE FUNCTION public.p1_miei_ruoli() RETURNS TABLE(codice text,nome text)
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $fn$
 SELECT * FROM private.p1_miei_ruoli();
$fn$;
REVOKE ALL ON FUNCTION public.p1_miei_ruoli() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.p1_miei_ruoli() TO authenticated;
REVOKE ALL ON FUNCTION private.p1_leggi_audit(timestamptz,uuid,integer) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION private.p1_leggi_audit(timestamptz,uuid,integer) TO authenticated;
CREATE OR REPLACE FUNCTION public.p1_leggi_audit(prima_di timestamptz,prima_id uuid,limite integer) RETURNS SETOF private.eventi_audit
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $fn$
 SELECT * FROM private.p1_leggi_audit(prima_di,prima_id,limite);
$fn$;
REVOKE ALL ON FUNCTION public.p1_leggi_audit(timestamptz,uuid,integer) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.p1_leggi_audit(timestamptz,uuid,integer) TO authenticated;
-- Prevent inherited column grants from defeating table revocations on reapply.
DO $acl$
DECLARE c record;
BEGIN
 FOR c IN SELECT table_schema,table_name,column_name FROM information_schema.columns
 WHERE (table_schema='public' AND table_name='profili') OR
 (table_schema='private' AND table_name IN ('ruoli','permessi','ruoli_permessi','utenti_ruoli','eventi_audit','janus_p1_version')) LOOP
 EXECUTE format('REVOKE ALL (%I) ON %I.%I FROM PUBLIC,anon,authenticated,service_role',c.column_name,c.table_schema,c.table_name);
 END LOOP;
END $acl$;
COMMIT;
