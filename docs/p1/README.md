# JANUS P1 — autenticazione, ruoli, permessi e audit

Proposta verificata il 16 novembre 2026. Obiettivo di consegna del prototipo: 14 dicembre 2026.

**Stato: pronto per revisione, non applicato.** Entrambi i progetti Supabase sono stati interrogati soltanto in lettura tramite cataloghi, configurazione dei privilegi, catalogo ruoli e conteggi. Nessun contenuto delle anagrafiche, credenziale o token è stato esportato. Non sono stati creati utenti remoti o eseguite migrazioni. La successiva autorizzazione riguarda esclusivamente pubblicazione del branch e PR in bozza, con deployment saltato.

## Consegne

| File | Contenuto |
| --- | --- |
| `../../supabase/migrations/20261116151348_janus_p1_auth_rbac_audit.sql` | Migrazione SQL transazionale, rieseguibile sulla base osservata |
| `matrice_ruoli_permessi.csv` | Matrice esatta: 46 permessi e 98 associazioni agli otto ruoli |
| `../../supabase/tests/p1/security.sql` | Test SQL con dati sintetici e ROLLBACK finale, da autorizzare prima dell'uso remoto |
| `../../supabase/tests/p1/local.mjs` | Validazione locale riproducibile con PGlite |
| `dipendenze.md` | Analisi dello schema originale, staging e repository |
| `rischi_e_decisioni.md` | Limiti, rischi e decisioni da approvare |
| `piano_test_e_rilascio.md` | Verifiche eseguite, test ancora necessari e procedura controllata |
| `pull_request.md` | Titolo, base e descrizione pronti per una PR in bozza |
| `../../supabase/tests/p1/fixtures.sql` | Strutture sintetiche per test locali; nessun dump interno incluso |

I percorsi di questa tabella sono relativi a `docs/p1/`. SQL e test sono sotto la radice del repository, in `supabase/`.

## Scelte del sistema

Supabase Auth rimane responsabile di password, login, verifica email, recupero password e MFA. `public.profili` rappresenta il profilo applicativo; i ruoli sono assegnati esclusivamente da operazioni privilegiate. Un account Auth senza profilo attivo e ruolo non riceve permessi applicativi. Nessun trigger assegna automaticamente Admin o Studente durante la registrazione. Il form di orientamento non crea utenti.

Le autorizzazioni vengono lette dalle tabelle a ogni istruzione SQL: revoche e disattivazione del profilo hanno effetto senza attendere un refresh dei claim. `user_metadata`, ruoli dichiarati dal client e ruoli salvati nella demo non autorizzano nulla. Sono richiesti email verificata, account non anonimo e assenza di ban attivo. Questo controllo non sostituisce la validazione JWT eseguita dal servizio API.

Le funzioni pubbliche `p1_miei_ruoli()` e `p1_miei_permessi()` restituiscono soltanto il contesto del chiamante. Le operazioni `p1_gestisci_ruolo()` e `p1_imposta_profilo_attivo()` richiedono permesso esplicito di gestione accessi e `aal2`. La rimozione o disattivazione dell'ultimo Admin attivo è bloccata; le due operazioni condividono un lock transazionale. Non si permettono scritture dirette dal client nelle sei tabelle.

La lettura profili avviene tramite RLS: ciascun ruolo vede il proprio profilo attivo; Admin può leggere tutti i profili. Le tabelle private restano senza policy client e senza grant diretti: sono accessibili soltanto attraverso funzioni controllate. Le funzioni `SECURITY DEFINER` sono nello schema `private`, hanno `search_path=''`, nomi qualificati e revoca di EXECUTE a PUBLIC/anon/service_role. Le funzioni esposte sono wrapper `SECURITY INVOKER`. Il proprietario privilegiato rimane parte del perimetro di fiducia.

Non si attribuisce un potere implicito al nome Admin: la matrice elenca i suoi permessi. Nessun ruolo riceve export o cancellazioni massive per impostazione iniziale. I ruoli multipli sommano i permessi; la scelta del portale e il divieto eventuale di cumulo Studente/personale richiedono una decisione prima dell'integrazione UI.

## Matrice sintetica

Questa tabella riassume la proposta; il CSV è la matrice normativa completa.

| Ruolo | Ambito iniziale |
| --- | --- |
| Admin | Gestione accessi con MFA; profili; operazioni esplicite sui moduli; lettura audit con MFA |
| Supervisore | Lettura dei moduli anagrafici e didattici; nessuna gestione accessi, audit o contabilità |
| Segreteria | Studenti, dati personali, referenti, iscrizioni, documenti e conferma orientamento |
| Didattica | Lettura studenti; gestione piani, esami, tutor e assegnazioni |
| Amministrazione | Lettura studenti; gestione contabilità |
| Tutor | Lettura studenti assegnati; lettura/modifica dei piani assegnati |
| Audit | Solo proprio profilo e lettura audit con MFA; nessun accesso alle anagrafiche |
| Studente | Lettura dei propri dati, piani, esami, documenti e contabilità |

**La migrazione P1 attiva il controllo su profili e sulle RPC di accesso/audit. I permessi dei moduli sono un catalogo predisposto: non aprono le tabelle applicative.** Lo staging non dispone ancora dei collegamenti utente–studente/tutor necessari alle policy per `propri` e `assegnati`. I cinque oggetti esistenti restano chiusi ai client; si preserva l'INSERT sulle dieci colonne di `richieste_contatto` già concesso a service_role.

Per attivare i moduli serviranno migrazioni dedicate: associazione uno-a-uno tra account e studente; collegamento account–tutor e assegnazioni con validità; policy SELECT/INSERT/UPDATE con USING e WITH CHECK coerenti; grant limitati alle colonne necessarie. Un permesso `propri` o `assegnati` non va mai interpretato come `tutti`. Per i campi modificabili dallo Studente saranno necessarie RPC dedicate o grant a colonne, senza permettere modifiche al proprietario o allo stato amministrativo.

## Audit minimizzato

Si registrano attore UUID, azione, tabella, chiave tecnica del record, timestamp ed esito. Nessuno snapshot JSON, nome, email, indirizzo, messaggio, IP, password, token o dato finanziario. Le chiavi composte di assegnazione ruolo e associazione permesso sono registrate integralmente. UUID e relazioni sono comunque dati da proteggere: il log non viene presentato come anonimo.

I trigger coprono le cinque tabelle di accessi/profili e le cinque tabelle applicative già presenti nello staging. Il log non ha trigger su se stesso. La lettura del log richiede permesso audit e MFA, registra l'accesso e usa cursore `(data,id)` con limite massimo 200. Per la prima pagina usare timestamp corrente e UUID `ffffffff-ffff-ffff-ffff-ffffffffffff`; per le successive usare la coppia dell'ultima riga.

Il log contiene operazioni riuscite nella stessa transazione: un rollback annulla anche il log. Tentativi negati, login falliti, logout e letture generali non sono catturati dai trigger. I tentativi Auth vanno verificati nei log Auth; una raccolta applicativa dei tentativi negati richiederà un endpoint server con tassonomia chiusa e senza contenuti personali. Non si espone una funzione client che possa inventare eventi arbitrari. Retention, consultazione e archiviazione restano da approvare; nessuna cancellazione automatica è configurata.

## Integrazione frontend da eseguire in seguito

Il codice in questa proposta non attiva un nuovo login. L'integrazione avverrà sulla versione del portale approvata: `signInWithPassword`, sessione Auth, risoluzione ruoli/permessi via RPC, challenge MFA per le operazioni protette, pulizia del contesto al logout e su cambi sessione. Email di conferma, redirect consentiti e recupero password richiedono configurazione staging separata. Il browser utilizzerà soltanto URL staging e chiave publishable; nessuna service_role. Le guardie UI migliorano la navigazione ma l'autorizzazione resta nel database.

## Fonti tecniche

- [Supabase: RLS e funzioni private](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: sessioni e durata dei JWT](https://supabase.com/docs/guides/auth/sessions)
- [Supabase: MFA](https://supabase.com/docs/guides/auth/auth-mfa)
- [Supabase: sicurezza Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Changelog CLI v3](https://supabase.com/changelog/supabase-cli-v3): verificato prima di usare la CLI; nessun comando remoto eseguito.
