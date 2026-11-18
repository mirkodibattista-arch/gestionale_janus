-- Dopo approvazione, disattivare prima l'accesso alla preview e il nuovo endpoint.
-- Il rollback conserva i profili e tutte le richieste.
begin;
alter role janus_orientation_edge nologin password null;
revoke janus_orientation_reader from janus_orientation_edge;
drop policy if exists janus_orientation_reader_richieste on public.richieste_contatto;
drop policy if exists janus_orientation_reader_profili on janus_privato.profili_aziendali;
revoke select (id, nome, cognome, email, telefono, indirizzo_interesse,
  modalita_interesse, messaggio, stato, ricevuta_il)
  on public.richieste_contatto from janus_orientation_reader;
revoke select (utente_id, ruolo, attivo)
  on janus_privato.profili_aziendali from janus_orientation_reader;
revoke usage on schema janus_privato, public from janus_orientation_reader;
commit;

-- Chiudere le sole connessioni del ruolo tecnico ancora aperte.
select pg_terminate_backend(pid)
from pg_stat_activity
where usename = 'janus_orientation_edge' and pid <> pg_backend_pid();
