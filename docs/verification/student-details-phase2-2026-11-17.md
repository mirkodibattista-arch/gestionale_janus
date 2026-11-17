# JANUS — verifica Fase 2 Scheda Studente Completa

Data: 17 novembre 2026. Branch: `feat/janus-student-anagrafica-draft`.
Commit GitHub recuperato e verificato: `148acb5966e890dd0d107244a0e0ad22857414a7`.

Verifica eseguita in una copia locale separata, preservando il precedente commit di recupero. Nessuna modifica remota, nessun push, merge, deployment o intervento su Supabase e PR #6/#7.

## Risultati

| Comando | Esito |
| --- | --- |
| `npm ci` | Superato: 145 pacchetti installati |
| `npm run typecheck` | Superato prima e dopo le correzioni |
| `npm run build` | Superato prima e dopo le correzioni, 1663 moduli |
| `npm test` | Fallito inizialmente per selettori della scheda precedente; superato dopo le correzioni, inclusa modalità demo disattivata |
| `npx playwright test --list` | Superato: 30 test individuati in 3 file |
| `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser -- --reporter=list` | Bloccato: 30 errori di avvio Chromium, prima dei controlli applicativi |
| `git diff --check` | Superato |

Il browser termina con `FATAL:chrome/browser/process_singleton_posix.cc:297` e `socket() failed: Operation not permitted (1)`. La prima esecuzione sul codice iniziale ha incontrato lo stesso blocco per i 27 test presenti. I controlli Playwright desktop/mobile e la resa visiva NON sono dichiarati superati. Nessun controllo browser è stato aggirato o disattivato.

## Difetti e correzioni

1. **Perdita dei referenti al cambio sezione.** Riprodotta con un test React che aggiungeva un referente, passava a Riepilogo e tornava a Referenti. Lo stato risiedeva nel componente smontato al cambio tab. Ora lo stato risiede nel modulo Studenti, indicizzato per ID studente: rimane durante il cambio sezione e il ritorno dall'elenco, senza essere condiviso tra studenti. Il ricaricamento/rimontaggio del modulo lo azzera. Il modulo rimane una demo in memoria.
2. **Test di modifica anagrafica non aggiornati.** I test cercavano il pulsante direttamente nella scheda iniziale. Ora aprono esplicitamente Anagrafica prima di Modifica studente; quando necessario tornano a Riepilogo per verificare l'assegnazione tutor. Il corrispondente test Playwright è aggiornato.
3. **Test dell'anteprima nel ramo sbagliato.** Il blocco recuperato della Fase 1 era stato inserito dentro `mode === "disabled"`, dove tentava di accedere alla demo disattivata. Spostato nel normale flusso demo; mantenute e superate le verifiche della modalità disattivata.
4. **Difese del form referenti.** Aggiunto controllo esplicito di `editable` nel gestore di inserimento/rimozione e di validità nativa prima dell'inserimento, così anche un evento submit programmatico non accetta email non valide o campi richiesti mancanti.

Durante l'ampliamento dei test, un'asserzione confrontava un nodo DOM inatteso con `null`, producendo un dump troppo grande e la terminazione del processo (codice 137). Corretti il selettore del secondo studente e le asserzioni booleane; l'esecuzione completa finale è terminata con codice 0.

## Verifiche funzionali effettivamente eseguite

Le verifiche seguenti sono test React/jsdom, non rendering visuale in un browser:

- Apertura dello studente dall'elenco e sezione iniziale Riepilogo.
- Navigazione a Riepilogo, Anagrafica e Referenti con contenuti coerenti.
- Nome obbligatorio, richiesta di almeno un recapito e rifiuto di email non valida nei referenti.
- Inserimento di due referenti sintetici, reset del form, rimozione selettiva e rimozione completa.
- Conservazione dei referenti al cambio sezione e ritorno dall'elenco; isolamento tra due studenti.
- Azzeramento al rimontaggio che simula il ricaricamento, con sessione demo mantenuta.
- LocalStorage e sessionStorage invariati durante inserimento/rimozione dei referenti; contatore delle chiamate backend uguale a zero.
- Regressioni della precedente anteprima: 14 campi, bozza/ripristino/invio, validazioni e reset dello stato.
- Regressioni di login, sessione, logout e otto ruoli; portali studente, perimetri Tutor/Audit, mutazioni consentite/negate, dashboard, form pubblico e CORS simulati.

## Permessi verificati

| Ruolo | Scheda aziendale Studenti | Modifica anagrafica/referenti |
| --- | --- | --- |
| Admin | Accessibile | Consentita |
| Segreteria | Accessibile | Consentita |
| Supervisore | Consultazione | Negata |
| Didattica | Consultazione; assegnazione tutor già prevista separatamente | Negata |
| Tutor | Consultazione nel proprio perimetro | Negata |
| Audit | Consultazione nel proprio perimetro | Negata |
| Amministrazione | Accesso al modulo negato dal routing corrente | Negata |
| Studente | Accesso al modulo aziendale negato; portale personale separato | Negata |

La suite verifica inoltre direttamente le guardie del CampusProvider per le mutazioni anagrafiche dei ruoli non autorizzati. Per i referenti è verificata la disponibilità del form per Admin/Segreteria e l'assenza dei comandi negli altri casi. Si tratta di autorizzazioni della demo client; nessuna garanzia di sicurezza server/RLS è dedotta da questi test.

## Persistenza e limiti

Il percorso dei referenti non importa client Supabase, non invoca API e non scrive in storage persistenti. I dati rimangono esclusivamente nello stato React del modulo Studenti. Si perdono al reload o all'uscita dal modulo che ne provoca lo smontaggio. Nessun dato personale reale è stato utilizzato.

Sono stati aggiunti tre test Playwright per la Fase 2 (1440×960, 390×844, matrice ruoli). Restano da eseguire in un ambiente che consenta l'avvio di Chromium. Eventuali requisiti di modifica per altri ruoli, persistenza oltre il modulo o integrazione backend richiedono decisioni e lavoro successivi.

Le correzioni e questo rapporto sono conservati in un commit locale del solo branch dedicato. Nessun push eseguito.
