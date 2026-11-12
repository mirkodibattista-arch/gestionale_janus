# Login demo JANUS

Il flusso attivo è Home pubblica → Login → Dashboard dell'account. L'URL del login è `#/login`; quello della dashboard è `#/campus/dashboard`. I link diretti del campus richiedono una sessione demo; una sezione vietata mostra Accesso negato. Le aree del catalogo non ancora sviluppate hanno una pagina esplicita di modulo previsto, senza operazioni CRUD.

## Account fittizi

Password comune: `CampusDemo!2026`. Non inserire credenziali o dati reali.

| Ruolo | Email |
| --- | --- |
| Admin | `admin@janus-demo.test` |
| Supervisore | `supervisore@janus-demo.test` |
| Segreteria | `segreteria@janus-demo.test` |
| Amministrazione | `amministrazione@janus-demo.test` |
| Didattica | `didattica@janus-demo.test` |
| Tutor | `tutor@janus-demo.test` |
| Studente | `studente@janus-demo.test` |

L'email viene cercata nel catalogo di account di prova; il ruolo proviene dal record associato, non da parole nell'email o nella password. Non è presente un selettore di ruolo nella dashboard. Per cambiare account uscire e accedere con altre credenziali demo.

## Sessione e limiti

La sessione dura otto ore dall'accesso. Il browser conserva soltanto versione, ID account e istante di accesso in `localStorage` (`janus.demo-auth.v1`), non la password. Il ruolo viene risolto nuovamente dalla fixture dell'account al ripristino. Il provider verifica la scadenza, aggiorna la sessione al focus della finestra e riceve gli eventi storage per sincronizzare il logout fra schede. Logout e sessioni non valide rimuovono il record locale.

**Questa modalità non offre autenticazione o autorizzazione sicure.** Catalogo, password condivisa e controlli sono nel bundle client; un utente può modificare il browser. Serve solo alla navigazione locale con dati sintetici. Le viste Tutor/Studente sono scenari di una singola identità fittizia, non una dimostrazione di isolamento di record reali. Segreteria, Tutor e Studente non hanno il link Amministrazione e la sua route diretta è negata nella demo.

`VITE_AUTH_MODE=demo` abilita il flusso locale (è anche il default). Un altro valore, ad esempio `disabled`, disabilita il login e il ripristino delle sessioni; non abilita un backend reale. Cambiare il valore nell'ambiente richiede il riavvio di Vite o una nuova build. La demo usa un proprio servizio e non chiama il client Supabase. Il form pubblico di orientamento conserva la sua integrazione precedente, separata: non è stato inviato durante le prove.

## Struttura

- `modules/auth/types.ts`: contratto AuthService e sessione.
- `modules/auth/demoAccounts.ts`: sole fixture di account e password demo.
- `modules/auth/demoAuthService.ts`: verifica demo, persistenza e scadenza, testabili con storage e orologio iniettati.
- `modules/auth/AuthProvider.tsx`: stato condiviso, login/logout e ciclo di vita della sessione.
- `routing/routes.ts`: parsing delle URL, mappa dei moduli consentiti e denominazioni della sidebar.
- `routing/useHashRoute.ts`: aggiornamento della vista su navigazione e avanti/indietro.
- `pages/LoginPage.tsx`: email/password, errori, stato di invio e toggle password.
- `pages/AccessDeniedPage.tsx`: pagina negata/non trovata.
- `modules/dashboard/demoData.ts`: dati sintetici specifici per i sette ruoli.

Un futuro adapter reale dovrà sostituire il servizio demo e risolvere dal server il ruolo, lo stato attivo e i permessi dell'identità autenticata. Le autorizzazioni devono essere applicate dal backend e dal database, inclusi i vincoli sui record propri/assegnati. Questa PR non introduce tale adapter, migrazioni o policy RLS e non modifica alcun file Supabase.

## Verifiche

```sh
npm ci
npm run build
npm run verify:refactor
npm run verify:auth
npm run verify:auth-ui
```

La regressione pubblica confronta sei stati del form con il commit iniziale, accettando soltanto la nuova etichetta del pulsante di accesso. Le vecchie comparazioni della dashboard sono sostituite dalle verifiche di autenticazione perché la selezione del ruolo è stata intenzionalmente rimossa.

I test del servizio coprono tutti gli account, l'associazione del ruolo, credenziali errate, account inattivo, logout, scadenza, storage non valido/bloccato, ruolo aggiunto al JSON e accessi consentiti/negati. Le prove UI React con jsdom coprono login dei sette ruoli, errori, visibilità password, ripristino al rimontaggio, navigazione, menu mobile, logout, evento storage fra schede simulato, scadenza al focus e demo disattivata. Nessun test esegue chiamate Supabase.

jsdom è l'unica nuova dipendenza ed è solo di sviluppo. Queste prove non verificano il layout renderizzato o il comportamento in un browser completo/Windows 11. L'avvio di Chromium nel presente ambiente è stato impedito da una restrizione del sistema sui socket; non è stato possibile effettuare la verifica visuale automatica.

## Prova manuale locale

Su Windows 11 aprire PowerShell nella cartella del repository, eseguire `npm install` e `npm run dev` (oppure `npm.cmd` se necessario). Aprire l'indirizzo Vite, accedere con ciascun account e provare: ricaricamento, logout e tasto Indietro, accesso diretto a `#/campus/amministrazione` come Studente, apertura del menu su una finestra stretta e logout da una seconda scheda. La pagina pubblica e il form restano accessibili senza login.
