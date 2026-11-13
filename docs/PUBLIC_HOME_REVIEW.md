# Integrazione Home pubblica e login — 13 novembre 2026

## Analisi e base scelta

| Branch | Commit analizzato | Risultato |
| --- | --- | --- |
| main | 09b5e9c | Home pubblica e form riutilizzabile; dashboard iniziale |
| feat/janus-modular-architecture | cc05624 | Refactor già incluso in main |
| feat/janus-demo-login | adbb398 | Login e ruoli, form ancora nel sorgente |
| feat/janus-digital-campus | 6242f70 | Campus demo e Audit |
| feat/janus-dual-portals | 67b22da | Area studente e due portali |
| feat/janus-digital-campus-v1 | 6df54f2 | Versione più completa: comprende due portali e dashboard personalizzate |

Branch di questa integrazione: **feat/janus-public-home-login**, derivato dalla v1 più completa. La PR verso main contiene anche le funzionalità v1 non ancora integrate: non serve eseguire merge delle PR precedenti per ottenere il risultato complessivo. Nessun secondo progetto e nessun merge effettuato.

## Piano applicato

Ripristinare OrientationPage come Home, aggiungere l’accesso campus, riusare il form su /orientamento, separare il login e mantenere i due portali con ruoli automatici. Convertire i link alla History API senza introdurre una seconda applicazione o duplicare le pagine. Conservare gli hash storici come compatibilità.

## Invarianti del form

Invariati rispetto a main:

- src/modules/orientation/hooks/useOrientationForm.ts
- src/modules/orientation/components/ContactRequestForm.tsx
- src/lib/supabase.ts
- supabase/functions/richiesta-contatto/index.ts
- Configurazione e migrazioni Supabase esistenti.

Il modulo chiama ancora richiesta-contatto con lo stesso payload; l’Edge Function scrive ancora richieste_contatto. Non sono state create nuove tabelle, utenti Auth o iscrizioni automatiche. È stata aggiunta nella Home e nella pagina /orientamento la distinzione tra richiesta di informazioni e iscrizione confermata.

## Interfaccia e navigazione

Home con hero e sezioni originali, più due percorsi distinti. Pulsante evidente “SEI GIÀ ISCRITTO? ACCEDI AL DIGITAL CAMPUS”, ingresso per il personale e navigazione pubblica mobile. Il login conserva email/password, mostra/nascondi, errori e recupero predisposto come non attivo.

Gli utenti autenticati possono visitare la Home pubblica; la Home non diventa mai una schermata di login. Lo stato del form si conserva nei cambi di pagina interni e nei passaggi avanti/indietro, fino al reload o all’azzeramento esplicito dopo l’invio. Non è scritto in localStorage.

Il routing mantiene le guardie prima del rendering delle pagine riservate. /campus/dashboard è riservato al personale, /campus/studente allo Studente; i sotto-moduli rispettano le autorizzazioni già presenti. Nessun selettore manuale di ruolo.

## Verifiche

- Build React/Vite e TypeScript strict.
- verify:refactor: confronto di sei stati del solo modulo con la baseline, lasciando libere le modifiche richieste all’header e alla Home.
- verify:public-ui: Home/form, CTA verso login, dati preservati al ritorno, back del browser, pagina dedicata senza doppio modulo, validazione, consensi, errore restituito, eccezione e conferma. Payload e file del trasporto confrontati con main.
- Invio simulato senza nuove iscrizioni/account: anagrafica demo sempre di 24 studenti, nessuna sessione creata dalla richiesta.
- verify:auth e verify:auth-ui: login, ruoli, menu, sessioni, scope, due portali, flussi condivisi e assenza di chiamate backend nei test.
- Verifica HTTP sul pacchetto compilato con Vite preview: `/`, `/orientamento`, `/login`, `/campus/dashboard`, `/campus/studente` e `/campus/studente/profilo` restituiscono index.html con HTTP 200; asset JavaScript disponibile. Questa prova non equivale a rendering browser.
- Sei test Playwright predisposti per desktop/mobile, inclusi Home e accessi diretti. La lista è verificata; esecuzione visuale ancora da completare per il blocco Chromium sui socket già rilevato nell’ambiente.
- Le prove del form usano uno stub della funzione e non scrivono nel database. L’invio effettivo a Supabase non è stato eseguito né dichiarato verificato in questa revisione.

## Cloudflare e sicurezza

Produzione su main e branch/PR per anteprime restano le destinazioni pianificate. Regole SPA in public/_redirects; nessuna modifica alle impostazioni Cloudflare, ai valori delle variabili o al progetto di produzione.

Il form conserva il backend esistente; i portali restano demo client, con dati fittizi. Supabase Auth, autorizzazione server, RLS e recupero password reale sono requisiti futuri di ADR-001, non attivati. Non sono state eseguite migrazioni, pubblicazioni, invii reali o merge.

## Vincolo CORS preesistente rilevato

Nel sorgente della Edge Function le origini ammesse sono istitutojanus.it, www.istitutojanus.it, localhost:5173 e 127.0.0.1:5173. localhost:5174 e host Pages non compaiono nella lista. La configurazione della funzione effettivamente pubblicata non è stata ispezionata: non si può garantire l’invio da tali origini. Questa limitazione è documentata; nessuna modifica alla funzione o alla sua configurazione. L’eventuale ampliamento delle origini richiederà una successiva autorizzazione esplicita.
