# JANUS — prototipo form e dashboard

Prototipo React + TypeScript del form pubblico di orientamento JANUS e di una dashboard staff dimostrativa.

## Contenuti

- Il form è un flusso guidato in tre passaggi e usa solo i campi minimi per una richiesta di orientamento.
- Le richieste vengono inviate direttamente alla Edge Function Supabase `richiesta-contatto`; il browser non accede alla tabella né usa credenziali privilegiate.
- La dashboard è solo una demo visuale con dati inventati e selettore Admin, Supervisore, Segreteria, Amministrazione e Didattica. Non implementa autenticazione e non legge dati dal database.
- È presente un avviso demo; per le prove usa solo nomi, recapiti e dettagli fittizi.

## Avvio locale

1. Installa Node.js 20 o successivo.
2. Copia `.env.example` in `.env.local`.
3. Installa i pacchetti con `npm install`.
4. Avvia con `npm run dev` e apri l'indirizzo locale indicato da Vite.

La chiave `sb_publishable_...` è una chiave pubblica per il client. Non inserire mai `service_role`, secret key o credenziali database nel frontend.

## Collegamento Supabase

Il client invoca `richiesta-contatto`, che valida i campi e salva direttamente `public.richieste_contatto` lato server. Gli origin `https://istitutojanus.it` e `https://www.istitutojanus.it` sono autorizzati dalla funzione. Per un nuovo dominio, aggiornare l'allowlist CORS della funzione prima della pubblicazione.

Il testo e la versione dell'informativa mostrati nel prototipo devono essere revisionati dal titolare del trattamento prima dell'utilizzo con dati reali. Questo progetto non è una valutazione legale o una conferma di conformità normativa.

## Architettura modulare

La struttura delle pagine, dei layout e dei moduli, il confronto con il piano JANUS e i passi successivi sono descritti in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Il codice attualmente caricato su `main` è il prototipo con cinque ruoli e selettore demo. Il login demo e le dashboard Tutor/Studente non sono presenti in questa versione; il refactor conserva le funzionalità esistenti.

Verifica la compilazione con `npm run build` e l'equivalenza del markup rispetto al commit iniziale con `npm run verify:refactor`. Il secondo comando usa solo rendering locale, blocca il client Supabase e richiede la storia Git del commit iniziale.
