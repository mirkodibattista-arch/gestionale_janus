# JANUS Digital Campus v1 — revisione del 13 novembre 2026

## Base analizzata

| Branch | Commit | Esito |
| --- | --- | --- |
| main | 09b5e9c | Refactor modulare già integrato |
| feat/janus-modular-architecture | cc05624 | Già incluso in main |
| feat/janus-demo-login | adbb398 | Login e sette ruoli, un commit oltre main |
| feat/janus-digital-campus | 6242f70 | Include integralmente il login e aggiunge campus demo |

Nuovo branch: `feat/janus-digital-campus-v1`, derivato dal campus più completo. Nessun refactor ricreato da zero. PR #2 e #3 preesistenti lasciate invariate; la nuova PR verso main include anche i loro commit non ancora integrati. Non unire le PR precedenti senza confrontare i contenuti sovrapposti.

## Incremento realizzato

- Form condiviso di creazione e modifica anagrafica, disponibile per Admin e Segreteria.
- Contatti, località, età, stato, percorso, indirizzo e anno scolastico modificabili; controlli su email duplicate, limiti dei campi e valori consentiti.
- Controlli anche nel provider, indipendenti dalla presenza dei pulsanti. Una modifica anagrafica non cambia tutor, saldo o verifiche documentali.
- Ricerca per nome, codice, email e città; azzeramento ricerca e filtri.
- Aggiornamento delle stesse entità in scheda, segreteria, dashboard e report. Nessuna persistenza dei dati studenti oltre il reload.
- Area personale senza pulsante per tornare all’elenco generale.
- Test di regressione, test browser riproducibili e istruzioni per futura configurazione Pages.

## Verifiche della revisione

| Verifica | Risultato |
| --- | --- |
| npm install | Completato |
| npm run build | Superato, TypeScript strict e Vite |
| npm run typecheck | Superato |
| npm test | Superato: account, tutti i menu per ruolo, sessioni, navigazione e operazioni demo |
| Modifica studenti | Superata in React/jsdom: duplicati rifiutati, modifica e ricerca email, aggiornamento Segreteria |
| Guardie dirette | Modifica rifiutata per Audit, Studente, Supervisore, Tutor, Didattica e Amministrazione; consentita per Segreteria |
| Backend | Fetch bloccato nei test; zero chiamate effettuate |
| npm run test:browser | Bloccato prima dei test: Chromium termina con socket() failed: Operation not permitted |
| npm run verify:refactor | Fallisce già sulla base: snapshot storico attende STUDENT MANAGER invece di DIGITAL CAMPUS |

Non è stata verificata visivamente questa revisione su browser desktop, mobile o Windows 11. Il test browser copre login, menu mobile, modifica scheda, overflow e Audit a 1440px e 390px, ma richiede esecuzione in un ambiente che consenta l’avvio di Chromium.

## Funzioni ereditate e limiti

Login, sette dashboard più Audit, 24 studenti sintetici, assegnazioni tutor, registro attività/assenze, saldi e documenti simulati, statistiche e CSV restano disponibili. Piani ed esami sono consultazioni sintetiche; documenti non sono allegati reali, WhatsApp e videochiamate sono registrazioni, contratti e operatori sono simulati. Non è dichiarato completato il gestionale di produzione o il confronto puntuale con GSJ: non è disponibile un accesso al GSJ originale.

L’adapter Auth e il repository dati esistenti restano punti di futura integrazione. Nessuna modifica ai file Supabase, al database o alle migrazioni. Nessuna pubblicazione né merge eseguiti.

Prossimo passo: eseguire le prove browser, rivedere la demo locale, quindi concordare il primo workflow reale di settore prima dell’integrazione dati.
