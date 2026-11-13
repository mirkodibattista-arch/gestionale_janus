# JANUS Digital Campus

Gestionale React + TypeScript + Vite, in modalità dimostrativa locale. Lavora sul repository JANUS esistente; nessun nuovo repository, nessuna pubblicazione e nessun collegamento al database in questa versione.

## Aprire su Windows 11

Dalla cartella del progetto che contiene `package.json`, apri PowerShell:

```powershell
git fetch origin
git switch feat/janus-digital-campus
npm.cmd ci
npm.cmd run dev
```

Apri nel browser l'indirizzo **Local** scritto da Vite (normalmente `http://localhost:5173/`). Il terminale deve restare aperto; `Ctrl+C` arresta l'app. Non aprire `index.html` facendo doppio clic. Non serve avviare PostgreSQL o configurare `.env.local`.

Se Git segnala modifiche locali, conservale prima di cambiare branch. Non usare comandi di ripristino distruttivi. Per scaricare aggiornamenti successivi sullo stesso branch: `git pull --ff-only`.

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

Il ruolo viene risolto dall'account, senza selettore. Per cambiare account usa **Esci**. La fixture contiene un digest SHA-256; password e hash non vengono salvati nella sessione. Questo meccanismo client, con credenziali pubbliche e dati interamente nel bundle, **non è autenticazione sicura**. Autorizzazioni server e RLS non sono implementate.

## Cosa provare

- **Studenti:** ricerca nome/cognome, cinque filtri combinabili, ordinamento e paginazione; apri il nome per la scheda. Admin e Segreteria possono aggiungere uno studente inventato.
- **Didattica / scheda studente:** Admin e Didattica possono cambiare tutor. L'assegnazione aggiorna anagrafica, elenchi tutor e statistiche.
- **Registro attività:** Admin, Didattica e Tutor registrano telefonate, videochiamate, WhatsApp, lezioni e assenze. I contatori si aggiornano senza ricaricare.
- **Segreteria:** conferma di verifica documentale simulata. Non carica file, non genera certificati o attestati.
- **Amministrazione:** saldo dimostrativo di una rata; nessun pagamento effettivo o servizio finanziario.
- **Statistiche / report:** filtri data/tutor per le attività e nuove iscrizioni, distribuzioni attuali, mappa schematica e report aggregato CSV.
- **Operatori:** aggiunta, sospensione e cambio ruolo simulati solo per Admin. Non modifica le credenziali e i ruoli degli account di login. Il proprio account non è modificabile.
- **Impostazioni:** ripristino delle fixture. Tema chiaro/scuro nel pulsante della barra superiore.

Tutor vede gli studenti di `TU-1`; Studente vede `ST-001`; Audit può consultare `ST-001`–`ST-006`, attività e report, senza operazioni di scrittura. I campi finanziari sono riservati ad Admin e Amministrazione.

Le operazioni sui dati durano **fino al ricaricamento della pagina** e sono condivise tra gli account provati nella stessa pagina. Sessione demo e tema sono salvati solo nel browser; nessun dato studente viene scritto in localStorage.

## Stato e limiti

La fase A è implementata insieme a un primo flusso operativo demo dei moduli successivi. Non è la versione completa di produzione: agenda, piani di studio, materie ed esami sono consultabili con contenuti sintetici; caricamento documenti, emissione certificati, gestione lezioni e valutazioni, contratti completi, notifiche e recupero password reale sono ancora da implementare. Nessuna chiamata WhatsApp, telefonata, email o videochiamata viene effettuata.

Il form pubblico precedente resta nel sorgente `src/modules/orientation`, ma è escluso dalle route attive della demo per evitare invii al backend. I file Supabase esistenti non sono modificati. L'analisi dello schema e l'integrazione reale richiedono una fase separata.

## Verifiche

```powershell
npm.cmd run build
npm.cmd run verify:auth
npm.cmd run verify:auth-ui
```

Build TypeScript rigoroso e Vite; test React/jsdom per otto account, tutte le route esposte, accessi negati, sessione/scadenza/logout, flussi tra moduli, sola lettura Audit, tema e assenza di chiamate backend. Le prove jsdom non sostituiscono i test su browser o Windows.

Vedi [docs/CAMPUS_IMPLEMENTATION.md](docs/CAMPUS_IMPLEMENTATION.md) per architettura, perimetro e verifiche browser. Il vecchio comando `verify:refactor` verifica uno snapshot storico del prototipo e non è un criterio di accettazione per il nuovo campus.
