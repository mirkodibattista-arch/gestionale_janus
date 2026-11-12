# JANUS Digital Campus

Applicazione React + TypeScript del campus JANUS: pagina pubblica di orientamento e gestionale dimostrativo con login locale e sette dashboard per ruolo.

## Avvio locale

1. Installa Node.js 20 o successivo.
2. Installa le dipendenze con `npm install`.
3. Avvia con `npm run dev` e apri l'indirizzo locale mostrato da Vite.
4. Premi **Accedi al campus** oppure apri `http://localhost:5173/#/login`.

In PowerShell puoi usare `npm.cmd` al posto di `npm` se l'esecuzione degli script è bloccata. Per il login demo non serve configurare Supabase.

## Login demo

Usa, ad esempio, `admin@janus-demo.test` e password `CampusDemo!2026`. Ogni account è associato a un ruolo e apre automaticamente la sua dashboard. Sono disponibili Admin, Supervisore, Segreteria, Amministrazione, Didattica, Tutor e Studente: credenziali, limiti e prove sono descritti in [docs/DEMO_LOGIN.md](docs/DEMO_LOGIN.md).

Il login ha email/password, mostra/nascondi password, errori, sessione locale di otto ore e logout. Sidebar, KPI, grafico, attività e priorità cambiano con l'account. Le sezioni non consentite mostrano Accesso negato. Le aree operative future hanno una pagina che ne chiarisce lo stato di modulo previsto.

**Questa demo frontend non è un'autenticazione sicura.** Le credenziali fittizie sono nel bundle e i controlli del browser sono modificabili. Usare solo account e dati sintetici. Impostare `VITE_AUTH_MODE=disabled` in `.env.local` e riavviare Vite per disabilitare la demo; ciò non attiva l'autenticazione reale.

## Pagina pubblica e integrazione precedente

Il form pubblico di orientamento resta accessibile senza login, con tre passaggi e i campi minimi già presenti. Conserva l'invio alla Edge Function `richiesta-contatto`, separato dal login demo. Nessun invio viene eseguito dai test. La dashboard non legge record dal database.

La configurazione preesistente del form è illustrata in `.env.example`: copiala in `.env.local` se devi configurarla. La chiave publishable è pubblica; non inserire credenziali privilegiate o password del database nel frontend. Funzione, migrazione e client Supabase non sono modificati da questa fase.

## Architettura e verifiche

La prima riorganizzazione e il piano iniziale sono documentati in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). L'evoluzione successiva di login e navigazione è in [docs/DEMO_LOGIN.md](docs/DEMO_LOGIN.md).

```sh
npm run build
npm run verify:refactor
npm run verify:auth
npm run verify:auth-ui
```

I test sono locali e bloccano le invocazioni Supabase. Le prove UI usano jsdom, non un browser completo; la verifica su Windows 11 e del layout responsive va completata localmente. Non è prevista alcuna pubblicazione automatica dell'applicazione.
