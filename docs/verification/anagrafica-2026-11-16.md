# Verifica Anagrafica Studente — 16 novembre 2026

Branch locale: `feat/janus-student-anagrafica-draft`.
Base verificata: `9253ec1c2c7d9670c0f948aeba9a193005c24bda`.

## Esito

| Comando | Esito |
| --- | --- |
| `npm ci` | Superato |
| `npm run typecheck` | Superato, anche dopo le correzioni |
| `npm run build` | Superato, anche dopo le correzioni |
| `npm test` | Superato dopo la correzione del selettore |
| `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser -- --reporter=list` | 27 fallimenti di infrastruttura, tutti prima dell'esecuzione dei test |

Chromium si arresta con `socket() failed: Operation not permitted` in `process_singleton_posix.cc`. Il download del browser Playwright era inoltre fallito per archivio non valido. L'esecuzione con permessi aggiuntivi è stata rifiutata dalla policy dell'ambiente. Nessun controllo è stato disabilitato per aggirare il problema. Non sono disponibili screenshot reali di questa esecuzione; responsive e rendering visivo restano da verificare.

## Problemi corretti

1. Il test di creazione studente selezionava il primo pulsante della toolbar, che ora apre l'anteprima. Seleziona ora il pulsante primario di creazione esistente, conservando le verifiche del flusso originale.
2. La data di nascita futura era accettata: aggiunti limite nativo del campo e controllo nel submit. La data limite usa il giorno locale.
3. Modificare una scheda già inviata lasciava lo stato `In verifica`: ogni modifica e il ripristino riportano lo stato a `Bozza`.

## Verifiche effettivamente superate

Suite React/jsdom: apertura del pulsante anteprima, 11 campi input e 3 select, obbligatorietà di nome/cognome, rifiuto di soli spazi, formato strutturale del codice fiscale e CAP, validità nativa email, data futura, salvataggio parziale, ripristino, invio simulato, ritorno a bozza dopo modifica, chiusura/riapertura, reset al rimontaggio e lista studenti invariata.

Accesso al pulsante verificato per tutti gli otto ruoli: disponibile ad Admin e Segreteria; assente per Supervisore, Didattica, Amministrazione, Tutor, Audit e Studente. Questa è una verifica dei permessi della demo UI, non della sicurezza backend.

Regressioni superate: login/sessione/logout degli otto ruoli, modalità demo disattivata, route, dashboard e operazioni condivise, perimetri Tutor/Audit, isolamento dei portali studente, home e form di orientamento, validazioni/errori/conferma e payload originale. Sei confronti di markup e 28 richieste CORS simulate superati. Nessuna chiamata Supabase nei test.

## Copertura browser preparata, non certificata

Aggiunti tre test Playwright: flusso anagrafica completo a 1440×960 e 390×844, più accessi degli otto ruoli. Le verifiche includono overflow orizzontale, nessuna richiesta esterna, errori JavaScript, assenza di persistenza e screenshot vuota/bozza/in verifica. Si aggiungono ai 24 test esistenti. Non vanno considerati superati finché Chromium non può essere avviato.

## Anteprima locale

Il server Vite è stato avviato sulla porta 5174 e la risposta HTTP verificata. Questo indirizzo è locale all'ambiente di lavoro, non è un sito pubblicato.

Per avviarla da una copia locale contenente le correzioni:

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5174
```

Aprire `http://127.0.0.1:5174/login`, usare l'account demo Admin già presente nel progetto, quindi Studenti → Anteprima nuova anagrafica. Non configurare credenziali Supabase per questa verifica; utilizzare esclusivamente dati inventati e non inviare il form pubblico verso servizi reali.

Per completare i controlli browser in un ambiente che consente Chromium:

```sh
npx playwright install chromium
npm run test:browser
```

Screenshot previsti in `test-results/`. I test dell'anagrafica bloccano le richieste esterne.

## Limiti e decisioni aperte

- Screenshot, uso touch e resa visuale desktop/smartphone ancora da verificare; jsdom non sostituisce un browser.
- Bozza e invio restano simulazioni in memoria: nessun workflow reale o persistenza.
- Codice fiscale verificato solo per lunghezza/caratteri; nessun controllo di checksum o corrispondenza anagrafica. Telefono/provincia non hanno validazione semantica completa. Campi obbligatori e regole definitive vanno concordati prima del backend.
- Nessuna modifica Supabase, nessun dato personale reale, nessun merge/deployment e nessuna modifica alle PR #6/#7.
- Le correzioni restano in un commit locale del branch dedicato: nessun push effettuato, per evitare deployment collegati agli aggiornamenti GitHub.
