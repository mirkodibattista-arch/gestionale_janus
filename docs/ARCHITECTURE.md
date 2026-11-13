> Integrazione corrente: [ADR-002 — Home pubblica e login](architecture/ADR-002-public-home.md). La Home resta pubblica con form; i portali adottano percorsi reali e conservano compatibilità con gli hash storici.

> Requisito permanente aggiornato il 13 novembre 2026: [ADR-001 — Un’applicazione, due portali](architecture/ADR-001-dual-portals.md). Questa decisione prevale sui riferimenti storici a un’unica interfaccia dashboard.

# Architettura JANUS Digital Campus

## Punto di partenza su main

Questa PR parte dal commit `466c2bd3c4fd6a7bc5c2d97001ce828cd6107832` del repository, non dal successivo archivio ZIP. È un prototipo React 18 + TypeScript strict + Vite 6, con Tailwind CSS 4, Lucide e un client Supabase già presente. Non sono presenti istruzioni AGENTS.md nel repository.

Il vecchio `src/App.tsx` contiene la pagina pubblica, il form orientamento in tre passi, validazione e invio alla Edge Function esistente, la dashboard demo, i dati dimostrativi e il selettore di cinque ruoli. Non contiene il login demo con riconoscimento automatico, le dashboard Tutor e Studente, un router URL o autorizzazioni. Il selettore è una funzione di anteprima, non un controllo di accesso.

## Struttura dopo l'estrazione

| Percorso | Responsabilità |
| --- | --- |
| `src/App.tsx` | Selezione pagina pubblica/dashboard e durata dello stato del form |
| `src/pages/OrientationPage.tsx` | Composizione della pagina pubblica |
| `src/pages/DashboardPage.tsx` | Composizione della dashboard e selezione demo del ruolo |
| `src/layouts/PublicLayout.tsx` | Banner, header, contenitore pubblico e footer |
| `src/layouts/DashboardLayout.tsx` | Sidebar, header, menu mobile, contenitore gestionale e footer |
| `src/components/Brand.tsx` | Identità JANUS condivisa |
| `src/components/ui/Field.tsx` | Campo input con etichetta condiviso |
| `src/components/ui/button.tsx` | Pulsante esistente, invariato |
| `src/modules/orientation/` | Tipi, percorsi, valori iniziali, componenti e hook del form |
| `src/modules/dashboard/` | Dati dei ruoli e componenti KPI, grafico, attività e pratiche |
| `src/modules/registry.ts` | Catalogo tipizzato dei domini e ordine della sidebar corrente |
| `src/types/roles.ts` | Unione dei cinque ruoli effettivamente presenti nel prototipo |
| `src/index.css` | Design JANUS esistente, invariato |
| `src/lib/` e `supabase/` | Client, utility, funzione e migrazione esistenti, invariati |

Il controller `useOrientationForm` è istanziato da `App` per mantenere i dati e il passo corrente quando si visita e si chiude la dashboard, come prima. La dashboard ricrea la selezione Admin alla riapertura, come prima. La sidebar resta una rappresentazione visuale: i moduli previsti nel catalogo non sono nuove route navigabili o funzioni CRUD.

I componenti di presentazione del form ricevono il controller; le altre viste ricevono soltanto props e dati demo. La chiamata alla Edge Function è isolata nell'hook e conserva endpoint e payload attuali. Nessuna migrazione o chiamata al database è necessaria per questo refactor.

## Confronto con il piano di sviluppo

| Obiettivo | Stato di questa PR | Passo successivo |
| --- | --- | --- |
| Architettura modulare | Pagine, layout, componenti, tipi e dati separati | Aggiungere una feature nel proprio modulo |
| Design JANUS | CSS e markup equivalenti al commit iniziale | Evoluzione grafica in una PR dedicata |
| Login e sette ruoli | Assenti su main; non introdotti dal refactor | Integrare login demo, sessione e navigazione protetta in una PR dedicata |
| Studenti e Tutor | Identificati nel catalogo come `planned` | Anagrafica sintetica condivisa e assegnazioni tutor |
| Segreteria | Dominio `planned`, etichette demo conservate | Iscrizioni, pratiche, documenti, piani ed esami |
| Didattica | Dominio `planned`, KPI demo conservati | Materie, assegnazioni, lezioni e avanzamento |
| Amministrazione | Dominio `planned`, KPI demo conservati | Contratti, rette, rate e pagamenti sintetici |
| Supabase Auth/RBAC/RLS | Nessuna modifica in questa PR | Revisione specifica prima di usare dati reali |

I flussi GSJ già discussi orientano il futuro lavoro (anagrafica unica, pratiche/documenti, percorsi, tutor e situazione economica). Questa PR non ricostruisce funzionalità da screenshot o documentazione GSJ non presenti nel repository.

Per una futura feature utilizzare `src/modules/<dominio>/` con tipi del dominio, dati/repository demo, componenti e hook; la pagina compone la feature nel layout gestionale. Aggiungere le cartelle quando esiste la prima funzione concreta, senza creare schermate vuote. Il catalogo non è una matrice RBAC: i futuri controlli di autorizzazione devono essere definiti separatamente e verificati lato server quando sarà attivato un backend.

## Verifica riproducibile

```sh
npm ci
npm run build
npm run verify:refactor
```

`build` esegue TypeScript strict e la build Vite. `verify:refactor` usa React server rendering e confronta il markup con il commit iniziale: tre passi del form, stati di invio/errore/successo e cinque dashboard con menu mobile chiuso/aperto (16 scenari). Il client Supabase è sostituito da uno stub che blocca ogni invocazione. La verifica richiede la storia Git con il commit iniziale; non richiede credenziali o una connessione al database. Non è una prova interattiva nel browser o un test Windows.

Il form di orientamento reale già presente nel prototipo conserva il suo invio alla Edge Function: le prove di questa PR non inviano il form e non leggono dati del database. Per lo sviluppo usare sempre recapiti fittizi.

## Evoluzione dopo la prima PR

La PR successiva sul branch `feat/janus-demo-login` aggiunge login demo, sette ruoli e navigazione per account. La fotografia e il confronto con main riportati sopra descrivono il punto di partenza della prima PR; non rappresentano più lo stato completo dell'app. Il nuovo stato e i limiti del login sono documentati in [DEMO_LOGIN.md](DEMO_LOGIN.md). La verifica della dashboard è ora affidata ai test Auth/UI e la regressione del form conserva sei scenari.

## Evoluzione Digital Campus

Le route attive e lo stato dell'implementazione successiva sono descritti in [CAMPUS_IMPLEMENTATION.md](CAMPUS_IMPLEMENTATION.md). Le descrizioni sopra fotografano il refactor storico; il campus aggiunge ora gli otto ruoli, il nuovo design e i primi flussi operativi demo.
