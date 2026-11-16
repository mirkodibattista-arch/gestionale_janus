-- Synthetic scaffolding for P1 tests only; not a JANUS business migration.
-- No real database schema, records or credentials are imported.
CREATE SCHEMA private;
CREATE TABLE public.studenti(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE public.studenti_dati_personali(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE public.referenti(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE public.studenti_referenti(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE public.richieste_contatto(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 nome text,cognome text,email text,telefono text,
 informativa_letta boolean,versione_informativa text,
 indirizzo_interesse text,modalita_interesse text,messaggio text,consenso_marketing boolean
);
ALTER TABLE public.studenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studenti_dati_personali ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studenti_referenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.richieste_contatto ENABLE ROW LEVEL SECURITY;
GRANT INSERT(nome,cognome,email,telefono,informativa_letta,versione_informativa,
 indirizzo_interesse,modalita_interesse,messaggio,consenso_marketing)
 ON public.richieste_contatto TO service_role;
