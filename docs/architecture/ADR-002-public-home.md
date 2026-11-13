# ADR-002 — Home pubblica e accesso al Digital Campus

Stato: **Accettata**. Decisione del committente: 13 novembre 2026. Integra ADR-001 e sostituisce la scelta temporanea di usare il login come Home.

## Decisione permanente

Un’unica applicazione React conserva la Home pubblica di orientamento e offre un secondo percorso per studenti già iscritti e personale. La Home non viene sostituita dal login, neppure quando esiste una sessione autenticata.

| Indirizzo | Esperienza |
| --- | --- |
| / | Home originale con hero, metodo, form e accesso campus |
| /orientamento | Stesso form pubblico, senza duplicazione di componenti |
| /login | Email/password demo; ruolo riconosciuto dall’account |
| /campus/dashboard | Dashboard personale aziendale |
| /campus/studente | Dashboard personale studente |
| /campus/:modulo | Moduli aziendali autorizzati |
| /campus/studente/:modulo | Sezioni personali autorizzate |

Le route hash delle versioni precedenti restano compatibili; dopo l’accesso alle pagine riservate vengono ricondotte ai percorsi correnti. History API, back/forward e link interni mantengono una sola istanza dell’applicazione. I filtri, gli hash per le sezioni della Home e i link esterni conservano il comportamento previsto.

## Percorso pubblico invariato nel backend

Il componente ContactRequestForm e l’hook useOrientationForm sono riutilizzati. Hook, validazione, payload, client Supabase, funzione richiesta-contatto, tabella di destinazione e migrazioni esistenti restano invariati. Nessun secondo form o backend.

La richiesta è una richiesta di orientamento: non è un’iscrizione confermata, non crea automaticamente uno studente o un account Auth e non assegna un ruolo. Il testo della Home lo chiarisce.

Il controller del modulo vive sopra il cambio di route: i dati digitati e lo stato di invio si conservano durante la navigazione interna verso il login e viceversa, fino al reload. Non vengono salvati in localStorage.

Il form conserva un’integrazione esistente capace di inviare una richiesta quando il visitatore sceglie di farlo; il portale riservato rimane demo. È errato descrivere l’intera applicazione come priva di backend o affermare che il form sia disattivato.

## Login e sicurezza futura

I due portali, ruoli, scope e guardie di ADR-001 restano validi. Il login usa solo account fittizi. Auth reale, associazione dei ruoli lato server, RLS e recupero password reale non vengono attivati in questa revisione. Il recupero password è presentato come predisposto, senza simulare l’invio di un’email.

## Verifiche e rilascio

Test del modulo con risposte simulate: dati obbligatori, consensi, errore restituito, errore sollevato, conferma, payload invariato, nessuna creazione automatica di account/iscrizione. Il test di regressione confronta i sei stati del solo form con la baseline; modifiche deliberate a header e Home non devono mascherare regressioni nei campi.

Le prove non inviano richieste reali a Supabase. Build e test dei portali vanno ripetuti dopo i cambi di routing. Le prove visuali browser restano distinte dai test jsdom.

Cloudflare Pages resta con produzione su main e branch/PR destinati alle anteprime. Le regole public/_redirects rendono disponibili i percorsi SPA dopo un accesso diretto. Non sono modificate le impostazioni dell’account Cloudflare e non vengono eseguiti deployment o merge.
