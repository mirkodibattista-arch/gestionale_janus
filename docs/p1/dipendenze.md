# Analisi delle dipendenze

Rilevazione del 16 novembre 2026 mediante pg_class, information_schema.columns, pg_constraint, pg_proc, pg_trigger, pg_policies, pg_depend, pg_indexes e ACL. Nessun DDL o DML remoto. Il repository include questa analisi riassuntiva; i dump interni di catalogo, ACL, policy e definizioni delle funzioni originali non vengono pubblicati.

## Repository

Analizzati `main` al commit `09b5e9cdd08b81b6811aca6345a625310444048d`, branch remoti e codice Auth/permessi del branch della [PR #6](https://github.com/mirkodibattista-arch/gestionale_janus/pull/6), head osservata `cbb3cab878c1f6a179bf0e3e8845721817de18e0`. Nessun AGENTS.md nel tree osservato.

`main` è React 18/TypeScript/Vite, con client supabase-js 2.95.0 e cinque ruoli UI; non ha login reale. Il client corrente disabilita persistenza e refresh sessione. La PR #6 contiene otto ruoli demo, servizio di autenticazione client con localStorage, dashboard e filtri client. Le credenziali demo e quei filtri non sono controlli server e non possono essere promossi a meccanismo di sicurezza. L'unica migrazione su main crea le richieste di contatto; mancano migrazioni versionate equivalenti al database originale completo.

Il branch P1 parte da main per rendere indipendente la revisione SQL: non incorpora o sostituisce le modifiche UI ancora in bozza nella #6. Si aggiungono documentazione, SQL e test; nessun componente frontend cambia.

## Confronto database

| Rilievo | Originale/dev `xengiuzlqjymjusajcih` | Staging `rwaotjfhiyhndlgljuuo` |
| --- | --- | --- |
| PostgreSQL | 17.11.0.018 | 17.11.0.019 |
| Tabelle public/private | 31 | 5 |
| Sei tabelle P1 | Presenti | Tutte assenti |
| Ruoli catalogati | Cinque: Admin, Supervisore, Segreteria, Didattica, Amministrazione | Catalogo assente |
| Profili / associazioni utenti-ruoli | 0 / 0 | Tabelle assenti |
| Policy applicative osservate | 79 | 0 |
| RLS | Attiva sulle tabelle osservate | Attiva su tutte e cinque |
| INSERT orientamento service_role | Grant limitato a colonne | Dieci colonne; nessun grant client |

Staging contiene `studenti`, `studenti_dati_personali`, `referenti`, `studenti_referenti`, `richieste_contatto`. Strutture diverse dall'originale: per esempio dati personali ha una propria PK `id`; referenti contiene anche codice fiscale; studenti_referenti ha qualifiche e campi per rappresentanza. Non copiare indiscriminatamente lo schema originale sopra questi oggetti.

## Dipendenze delle sei tabelle originali

| Oggetto | Dipendenze strutturali | Dipendenti applicativi |
| --- | --- | --- |
| `public.profili` | PK user_id; FK auth.users(id); nome, attivo, created_at | FK utenti_ruoli.user_id; policy profilo_proprio; lookup permessi e controllo Admin; trigger audit |
| `private.ruoli` | PK UUID; codice UNIQUE | FK ruoli_permessi.ruolo_id e utenti_ruoli.ruolo_id; gestione ruoli e controllo Admin; trigger audit |
| `private.permessi` | PK UUID; UNIQUE risorsa/azione/ambito; CHECK azioni e ambiti | FK ruoli_permessi.permesso_id; lookup/configurazione permessi; trigger audit |
| `private.ruoli_permessi` | PK composta; FK verso ruoli e permessi | Lookup ha_permesso e configurazione permessi; indice permesso_id; trigger audit |
| `private.utenti_ruoli` | PK composta; FK verso profili e ruoli | Lookup permessi, gestione ruoli, protezione ultimo Admin; indice ruolo_id; trigger audit |
| `private.eventi_audit` | PK UUID; timestamp; attore senza FK; indice data | Destinazione del trigger private.audit_modifica applicato a tabelle applicative e RBAC |

Nessuna view public/private osservata. Nessun trigger applicativo di provisioning su auth.users rilevato. PK/FK non usano cascata distruttiva nella catena P1.

`pg_depend` rappresenta dipendenze di vincoli, indici, trigger e policy, ma non è sufficiente a ricostruire i riferimenti nelle funzioni SQL/PLpgSQL con corpo testuale. Per questo sono state lette anche tutte le definizioni delle funzioni e delle policy nei due schemi.

Dipendenze logiche originali principali:

- `private.ha_permesso(text,text)` legge profili attivi, utenti_ruoli, ruoli, ruoli_permessi, permessi; tratta Admin come bypass implicito e considera soltanto `ambito='tutti'`.
- Le policy dei moduli chiamano `ha_permesso`. Altre policy per domanda e documenti usano `auth.uid()`, email verificata e ownership.
- `public.miei_permessi`, `public.gestisci_ruolo`, `public.configura_permesso` sono wrapper delle funzioni private. `miei_permessi` enumera un insieme fisso di risorse/azioni e restituisce tutti, senza esporre scopes propri/assegnati.
- `private.gestisci_ruolo` e `private.configura_permesso` verificano Admin attivo e MFA; la gestione ruoli usa un lock e impedisce la revoca dell'ultimo Admin.
- `private.conferma_domanda` usa ha_permesso e modifica anagrafiche, referenti, iscrizioni, piani, documenti e domanda. `private.invia_domanda`, `private.limita_bozze` e relative policy dipendono dal sistema autorizzativo. Non vengono trasferite nella P1.
- `private.audit_modifica` registra UUID e chiave record; nell'originale la fallback id/user_id non identifica completamente le associazioni composte. La proposta P1 usa entrambe le componenti.

## Ordine della proposta

Creazione schema/marker → profili con FK auth.users → ruoli e permessi → tabelle associative → audit → lookup privato e RLS profili → trigger → catalogo iniziale → RPC controllate. Le RPC pubbliche sono create per ultime. Il tutto è una singola transazione, con timeout e lock della gestione accessi.

La migrazione rifiuta un ambiente che abbia già una delle sei tabelle ma non il marker P1; sul dev osservato si fermerebbe prima di qualunque DDL, anche se un operatore impostasse erroneamente il consenso staging. È una protezione aggiuntiva, non una garanzia universale di identificazione del progetto.
