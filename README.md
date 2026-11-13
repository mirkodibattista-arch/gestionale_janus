# JANUS Digital Campus

Un’unica applicazione React + TypeScript + Vite: Home pubblica con form di orientamento e integrazione Supabase esistente, più Digital Campus in modalità demo per personale e studenti. Nessun nuovo repository o deployment in questa revisione.

## Aprire su Windows 11

Dalla cartella del progetto che contiene `package.json`, apri PowerShell:

```powershell
git fetch origin
git switch feat/janus-public-home-login
git pull --ff-only
npm.cmd install
npm.cmd run dev
```

Apri nel browser l'indirizzo **Local** scritto da Vite (normalmente `http://localhost:5173/`). Il terminale deve restare aperto; `Ctrl+C` arresta l'app. Non aprire `index.html` facendo doppio clic. Non serve avviare PostgreSQL per i portali demo. Per inviare il form pubblico servono le variabili Supabase già previste in `.env.example` e configurate nell’ambiente esistente. Conservare tali impostazioni; senza configurazione valida il form mostra un errore, non una conferma simulata.

Se Git segnala modifiche locali, conservale prima di cambiare branch. Non usare comandi di ripristino distruttivi. Per scaricare aggiornamenti successivi sullo stesso branch: `git pull --ff-only`.

Il sorgente della funzione ammette le origini locali sulla porta **5173**; `localhost:5174` e i domini Pages non sono nella lista CORS del repository. La funzione pubblicata potrebbe differire: l’invio reale da queste origini resta da verificare. Nessuna modifica alle origini è stata effettuata.

## Home pubblica e login

La pagina iniziale resta la Home pubblica originale con form. Il pulsante **SEI GIÀ ISCRITTO? ACCEDI AL DIGITAL CAMPUS** apre `/login`; anche il personale usa lo stesso accesso. `/orientamento` riusa lo stesso modulo. Un account già autenticato può tornare alla Home senza essere reindirizzato al campus.

La decisione corrente è [ADR-002](docs/architecture/ADR-002-public-home.md). Le route del form e del login si aggiungono ai due portali di ADR-001.

## Architettura permanente: due portali

Un’unica applicazione JANUS, un solo login e un’unica anagrafica condivisa. L’account determina automaticamente il portale:

- **Portale Aziendale** (`/campus/dashboard`): Admin, Supervisore, Segreteria, Didattica, Amministrazione e Tutor. Audit è una modalità aziendale in sola lettura.
- **Portale Studente** (`/campus/studente`): interfaccia dedicata a profilo, piano, materie, calendario, tutor, documenti, esami, avanzamento e comunicazioni personali.

Le vecchie route `#/campus/...` restano compatibili e portano al portale autorizzato. Uno studente non può aprire il portale aziendale; il personale non può usare il portale Studente come impersonificazione.

Requisito permanente: [ADR-001](docs/architecture/ADR-001-dual-portals.md). Supabase Auth, autorizzazioni server e RLS sono **progettati, non attivati**; in questa fase sono disponibili solo fixture e controlli client. Il futuro backend dovrà restituire esclusivamente i dati autorizzati. Non inserire dati reali nella demo.

## Accessi demo

Password di prova comune: **`CampusDemo!2026`**. È pubblica e serve solo alle prove.

| Ruolo           | Email                           |
| --------------- | ------------------------------- |
| Admin           | admin@janus-demo.test           |
| Supervisore     | supervisore@janus-demo.test     |
| Segreteria      | segreteria@janus-demo.test      |
| Didattica       | didattica@janus-demo.test       |
| Amministrazione | amministrazione@janus-demo.test |
| Tutor           | tutor@janus-demo.test           |
| Studente        | studente@janus-demo.test        |
| Audit           | audit@janus-demo.test           |

Il ruolo e il collegamento a studente/tutor vengono risolti dall’account fixture, senza selettore. Per cambiare account usa **Esci**. La fixture contiene un digest SHA-256; password e hash non vengono salvati nella sessione. Questo meccanismo client, con credenziali pubbliche e dati interamente nel bundle, **non è autenticazione sicura**. Autorizzazioni server e RLS non sono implementate.

## Dashboard di reparto

Admin dispone di quadro generale, priorità documentali/iscrizioni/pagamenti, grafico iscrizioni e attività recenti. Segreteria vede pratiche e documenti; Didattica lezioni e assenze; Tutor i propri studenti e attività; Amministrazione contratti e saldi simulati; Supervisore e Audit indicatori di consultazione. I collegamenti rapidi rispettano i menu autorizzati e i conteggi cambiano con le operazioni demo.

## Cosa provare

- **Studenti:** ricerca per nome, email, codice e città, cinque filtri combinabili, ordinamento e paginazione; apri il nome per la scheda. Admin e Segreteria possono aggiungere e modificare uno studente inventato. Email univoca, campi validati e pulsante per azzerare i filtri.
- **Didattica / scheda studente:** Admin e Didattica possono cambiare tutor. L'assegnazione aggiorna anagrafica, elenchi tutor e statistiche.
- **Registro attività:** Admin, Didattica e Tutor registrano telefonate, videochiamate, WhatsApp, lezioni e assenze. I contatori si aggiornano senza ricaricare.
- **Segreteria:** conferma di verifica documentale simulata. Non carica file, non genera certificati o attestati.
- **Amministrazione:** saldo dimostrativo di una rata; nessun pagamento effettivo o servizio finanziario.
- **Statistiche / report:** filtri data/tutor per le attività e nuove iscrizioni, distribuzioni attuali, mappa schematica e report aggregato CSV.
- **Operatori:** aggiunta, sospensione e cambio ruolo simulati solo per Admin. Non modifica le credenziali e i ruoli degli account di login. Il proprio account non è modificabile.
- **Impostazioni:** ripristino delle fixture. Tema chiaro/scuro nel pulsante della barra superiore.

Gli account demo hanno associazioni esplicite: Tutor → `TU-1`, Studente → `ST-001`; Audit può consultare `ST-001`–`ST-006`, attività e report, senza operazioni di scrittura. I campi finanziari sono riservati ad Admin e Amministrazione.

Le operazioni sui dati durano **fino al ricaricamento della pagina** e sono condivise tra gli account provati nella stessa pagina. Sessione demo e tema sono salvati solo nel browser; nessun dato studente viene scritto in localStorage.

## Stato e limiti

La fase A è implementata insieme a un primo flusso operativo demo dei moduli successivi. Non è la versione completa di produzione: agenda, piani di studio, materie ed esami sono consultabili con contenuti sintetici; caricamento documenti, emissione certificati, gestione lezioni e valutazioni, contratti completi, notifiche e recupero password reale sono ancora da implementare. Nessuna chiamata WhatsApp, telefonata, email o videochiamata viene effettuata.

Il form pubblico è attivo su `/` e `/orientamento` e conserva l’invio esistente tramite la funzione `richiesta-contatto`. La richiesta non è un’iscrizione confermata e non crea un account. Hook, payload e file Supabase sono invariati. I test simulano le risposte senza inviare dati al backend.

Per questa integrazione vedere [docs/PUBLIC_HOME_REVIEW.md](docs/PUBLIC_HOME_REVIEW.md); il consolidamento precedente è documentato in [docs/V1_REVIEW.md](docs/V1_REVIEW.md).

## Verifiche

```powershell
npm.cmd run build
npm.cmd test
```

Build TypeScript rigoroso e Vite; test React/jsdom per otto account, tutte le route esposte, accessi negati, sessione/scadenza/logout, flussi tra moduli, sola lettura Audit, tema e assenza di chiamate backend. Le prove jsdom non sostituiscono i test su browser o Windows.

Test browser riproducibili (Chromium):

```powershell
npx.cmd playwright install chromium
npm.cmd run test:browser
```

Le prove browser di questa revisione sono predisposte per 1440px e 390px, ma qui sono bloccate all’avvio di Chromium da `socket() failed: Operation not permitted`. Non sono dichiarate superate. `npm test` esegue le verifiche funzionali jsdom; `npm run typecheck` controlla TypeScript.

Per il collegamento futuro a Cloudflare, vedi [docs/CLOUDFLARE_PAGES.md](docs/CLOUDFLARE_PAGES.md). Nessun comando di pubblicazione è incluso.

Vedi [docs/CAMPUS_IMPLEMENTATION.md](docs/CAMPUS_IMPLEMENTATION.md) per architettura, perimetro e verifiche browser. `verify:refactor` confronta i sei stati del solo form con la baseline; `verify:public-ui` prova il flusso pubblico con risposte simulate. Entrambi sono inclusi in `npm test`.
