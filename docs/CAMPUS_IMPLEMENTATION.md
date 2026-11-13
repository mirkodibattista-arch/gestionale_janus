> Per la struttura attuale a due portali, vedere [ADR-001](architecture/ADR-001-dual-portals.md). Le verifiche qui sotto si riferiscono alla prima revisione del campus.

# Prima versione navigabile JANUS Digital Campus

## Analisi iniziale

`main` al commit `09b5e9c` conteneva il refactor del prototipo: form pubblico, dashboard statica per cinque ruoli con selettore manuale e moduli pianificati. I branch trovati erano `main`, `feat/janus-modular-architecture` e `feat/janus-demo-login`.

Il commit `adbb398` del branch login aggiungeva sette account, sessioni e routing con guardie, ma le pagine dei moduli erano anteprime. È stato recuperato con cherry-pick sul nuovo branch `feat/janus-digital-campus`, derivato da `main`, prima dello sviluppo del campus. Nessuna modifica su main o al database.

## Piano e stato

| Fase                  | Risultato implementato                                                                                            | Da completare                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| A — Fondamenta        | Design system blu notte/ciano, temi, login demo, otto ruoli, menu e guardie, dashboard con dati aggregati         | Auth e autorizzazioni server                                 |
| B — Studenti          | Unica anagrafica, cinque filtri, ricerca, ordine, paginazione, creazione demo e scheda                            | Modifica completa anagrafica, allegati reali                 |
| C — Tutor e didattica | Elenchi tutor e competenze, assegnazioni mutabili, registro contatti/lezioni/assenze                              | CRUD lezioni, valutazioni, disponibilità e piani reali       |
| D — Reparti           | Documenti verificabili in demo, saldi simulati, area personale e Audit, operatori simulati                        | Contratti completi, certificati, file e workflow documentali |
| E — Analytics         | Conteggi coerenti, grafico iscrizioni, filtri attività/iscrizioni, distribuzioni, mappa schematica, CSV aggregato | Serie storiche reali, ulteriori formati report               |

Si tratta di una prima versione demo operativa: il completamento della fase A non equivale al completamento dell'intero gestionale.

## Architettura

- `App.tsx`: compone provider e route. Il form pubblico non è nel flusso attivo.
- `modules/auth`: servizio sostituibile e sessione locale; digest della password demo pubblica, non una protezione reale.
- `routing/routes.ts`: catalogo dei moduli autorizzati per ogni ruolo e controllo della route prima del rendering.
- `layouts/DashboardLayout.tsx`: navigazione, menu mobile, tema e logout.
- `modules/campus/types.ts`, `fixtures.ts`: anagrafica, tutor, attività e operatori con ID condivisi.
- `services/campusRepository.ts`: punto di sostituzione del caricamento delle fixture con un futuro adapter API. L'adapter reale dovrà aggiungere lettura asincrona e mutazioni server.
- `modules/campus/CampusProvider.tsx`: stato condiviso e controllo delle mutazioni. Audit, Studente e Supervisore non possono scrivere neppure passando dalle funzioni di modifica.
- `modules/campus/permissions.ts`: perimetri demo per studente, tutor e Audit; capacità per settore.
- `modules/students`, `activities`, `analytics`, `dashboard`: viste e flussi funzionali.
- `OperationsModule.tsx`: prime viste sintetiche dei reparti; da separare ulteriormente quando entreranno i workflow completi.

I componenti storici della dashboard precedente restano nel repository ma non sono usati dalle route attive; i dati di quelle fixture non alimentano il nuovo campus.

## Coerenza e perimetri

24 studenti, 3 tutor, 24 attività iniziali. Contatori e distribuzioni derivano dalle stesse entità. Il CSV rispetta il perimetro visibile e i filtri del report; le celle vengono quotate e i prefissi formula neutralizzati.

- Tutor demo: assegnazioni a `TU-1` (8 studenti iniziali).
- Studente demo: `ST-001`.
- Audit demo: 6 ID autorizzati, espliciti e indipendenti dall'ordinamento.
- Dati finanziari nelle schede solo per Admin/Amministrazione.
- Le modifiche agli operatori sono simulate e non alterano gli account di login.

Tutte queste regole sono client e non proteggono dati reali. L'intero dataset è un bundle pubblico dimostrativo. Nessuna nuova chiave, migrazione o modifica Supabase; nessun invio di moduli a servizi esterni nel percorso attivo.

## Verifica riproducibile

- `npm ci` completato.
- `npm run build` passato (TypeScript rigoroso + Vite).
- `npm run verify:auth` passato: otto account, mapping ruoli, password errata, sessione manipolata/corrotta/scaduta, storage bloccato e accessi.
- `npm run verify:auth-ui` passato: login/logout degli otto account, ogni route del menu, accessi negati, modalità demo disattivata, password visibile/nascosta, stato condiviso tra moduli, creazione studente, registrazione attività con KPI aggiornato, saldo e verifica documenti, tema e perimetri Tutor/Audit. Fetch viene bloccato durante il test.
- Browser Chromium desktop: login Admin, dashboard, ricerca Sofia, apertura scheda, navigazione Statistiche, tema chiaro, download CSV. Nessun overflow orizzontale della pagina alla larghezza desktop verificata.
- Il CSS include layout a una colonna e menu mobile sotto 760 px, ma la verifica visuale a viewport mobile e l'esecuzione su Windows 11 non sono state effettuate in questo ambiente.

## Prossimi passi

1. Revisionare PR e provare la demo in locale.
2. Confermare campi, perimetri dei ruoli e flussi operativi con i settori.
3. Analizzare lo schema PostgreSQL esistente prima di progettare adapter, autenticazione e RLS.
4. Implementare persistenza e workflow completi per un modulo alla volta, con dati di prova.
