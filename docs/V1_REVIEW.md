# JANUS Digital Campus v1 — consolidamento del 13 novembre 2026

## Analisi prima dello sviluppo

| Branch analizzato | Commit iniziale | Contenuto |
| --- | --- | --- |
| main | 09b5e9c | Refactor modulare integrato |
| feat/janus-modular-architecture | cc05624 | Già incluso in main |
| feat/janus-demo-login | adbb398 | Login demo e sette ruoli |
| feat/janus-digital-campus | 6242f70 | Campus navigabile e Audit |
| feat/janus-digital-campus-v1 | c702c0f | Modifica anagrafica e validazione |
| feat/janus-dual-portals | 67b22da | Due portali e requisito architetturale permanente |

Tutti i branch appartengono alla stessa sequenza di sviluppo. La base funzionale più completa è dual-portals. Il lavoro viene consolidato in **feat/janus-digital-campus-v1**, come richiesto, preservando il contenuto dei due portali. Nessun merge di PR eseguito e nessuna modifica a main.

## Piano tecnico applicato

1. Conservare React 18, TypeScript strict, Vite, AuthProvider e servizi demo sostituibili.
2. Consolidare il routing protetto dei due portali e la sola anagrafica condivisa.
3. Rendere distinti indicatori e priorità delle dashboard di reparto con dati calcolati dal CampusProvider.
4. Conservare ricerca, cinque filtri, paginazione, creazione/modifica e schede studenti.
5. Verificare login, tutti i ruoli, navigazione, aggiornamenti tra moduli e limiti demo.
6. Mantenere preparazione Cloudflare documentale, senza deployment. Aggiornare la PR v1 verso main per una revisione complessiva.

## Moduli e responsabilità

- App.tsx: autenticazione, guardie, scelta del portale e compatibilità con le vecchie route.
- modules/auth: credenziali fittizie, ruolo e scope da account, sessione demo, nessun adapter reale attivo.
- layouts: layout aziendale e studente distinti, tema condiviso e navigazione per ruolo.
- modules/campus: stato e mutazioni demo, anagrafica unica e proiezione didattica condivisa.
- modules/dashboard/summary.ts: indicatori e priorità di reparto calcolati sul perimetro visibile; collegamenti limitati ai moduli autorizzati.
- modules/students: ricerca, filtri, scheda e form anagrafico validato.
- modules/student-portal: esperienza personale, comunicazioni rivolte al solo studente e assenza di note interne.
- services/campusRepository.ts: confine esistente per il futuro accesso dati.

## Accessi e dashboard

I ruoli aziendali nominati sono sei: Admin, Supervisore, Segreteria, Didattica, Amministrazione e Tutor. Con la modalità Audit sono sette profili aziendali; lo Studente ha il portale personale. Non è stato inventato un ulteriore ruolo per risolvere la differenza nel conteggio.

| Profilo | Quadro operativo demo |
| --- | --- |
| Admin | Studenti, tutor, attività, documenti; priorità iscrizioni/documenti/rate |
| Supervisore | Iscrizioni, sospensioni, avanzamento e attività; consultazione |
| Segreteria | Iscrizioni, documenti da verificare e programmazione esami |
| Didattica | Studenti, tutor, lezioni e assenze |
| Tutor | Studenti assegnati, lezioni, assenze e avanzamento del proprio perimetro |
| Amministrazione | Saldo, rate, contratti sintetici e posizioni saldate |
| Audit | Soli studenti autorizzati, attività, documenti e avanzamento; nessuna scrittura |
| Studente | Profilo, piano/materie, calendario, tutor, documenti, esami, avanzamento e comunicazioni |

Il login mantiene il design futuristico e presenta esplicitamente i due portali della stessa applicazione. Ruolo e portale derivano dall’account, senza selettore manuale. Non è presente una home vetrina nel flusso attivo.

## Verifica

- npm run build: compilazione TypeScript strict e Vite superata.
- npm run typecheck: controllo TypeScript separato.
- npm test: login/logout degli otto account, tutte le voci dei menu, guardie, sessioni, due portali e operazioni demo.
- Dashboard: indicatori differenziati per ruolo, tutti i collegamenti rapidi autorizzati e funzionanti; priorità Admin aggiornate dopo saldo e verifica documenti.
- Due identità studente distinte nei test, associazione ricostruita anche dopo alterazione del localStorage, nessun fallback a un altro studente.
- Test con backend bloccato: zero chiamate Supabase.
- Quattro test browser desktop/mobile predisposti. La lista dei test è verificabile con npm run test:browser -- --list. Esecuzione visuale ancora da completare: Chromium è stato bloccato nell’ambiente da socket() failed: Operation not permitted.
- Il vecchio verify:refactor confronta ancora uno snapshot del prototipo STUDENT MANAGER; il fallimento storico è noto e non è un criterio di accettazione del campus attuale.

## Stato e limiti

Prima versione navigabile demo. Piani/materie/calendario/esami sintetici; documenti senza allegati reali, notifiche locali, saldi e operatori simulati. Le modifiche ai dati durano fino al reload. Non è il gestionale completo di produzione e non è stato effettuato un confronto puntuale con GSJ originale in assenza di accesso.

La [ADR-001](architecture/ADR-001-dual-portals.md) è il requisito permanente. Auth, autorizzazione server e RLS sono progettati per la futura integrazione e non attivi. Il bundle demo contiene dati fittizi e i filtri client non proteggono dati reali.

Nessuna modifica a Supabase, migrazione, nuovo repository, ZIP o deployment. La PR #4 verso main diventa la revisione complessiva v1; la PR #5 conserva lo sviluppo precedente a due portali, ora incluso come contenuto nella v1. Non è richiesto effettuare merge separati delle PR sovrapposte.
