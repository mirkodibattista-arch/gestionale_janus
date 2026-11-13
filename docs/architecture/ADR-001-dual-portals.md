> Aggiornamento: [ADR-002](ADR-002-public-home.md) ripristina la Home pubblica e introduce il routing per percorsi. I riferimenti hash e l’esclusione temporanea del form nelle versioni precedenti sono storici.

# ADR-001 — Un’applicazione JANUS, due portali

Stato: **Accettata, requisito permanente**. Decisione del committente: 13 novembre 2026.

## Decisione

JANUS Digital Campus è il gestionale riservato al personale aziendale e agli studenti. Un solo progetto React/TypeScript, un solo sistema di autenticazione e un unico database PostgreSQL condiviso. I portali sono due esperienze della stessa applicazione, non due siti o database indipendenti.

| Portale | Utenti | Interfaccia |
| --- | --- | --- |
| Aziendale | Admin, Supervisore, Segreteria, Didattica, Amministrazione, Tutor | Dashboard e operazioni differenziate per responsabilità |
| Studente | Studente | Area personale semplice, limitata al proprio percorso |

Audit rimane una modalità aziendale speciale di sola lettura nel perimetro autorizzato; non è un terzo portale.

Il ruolo viene risolto dopo l’autenticazione. Non è selezionabile e non deriva dal nome dell’email. Il collegamento account ↔ anagrafica studente è un’associazione esplicita, immutabile dal client. In caso di associazione mancante, il sistema non mostra alcuno studente.

## Stato implementato nella demo

- Login unico; destinazioni `#/azienda/dashboard` e `#/studente/dashboard` determinate dal ruolo.
- Route del portale sbagliato negate anche quando il modulo ha lo stesso nome. I vecchi collegamenti `#/campus/...` sono alias verificati e reindirizzati al portale corretto.
- Layout aziendale preservato; layout studente dedicato con navigazione personale desktop/mobile.
- Sezioni studente: profilo, piano, materie, calendario, tutor, documenti, esami, avanzamento, comunicazioni e notifiche locali.
- Scope demo associato agli account fixture, ricostruito durante il ripristino della sessione. Il localStorage non è fonte attendibile di ruolo o ID studente.
- Un solo CampusProvider e repository demo. Modifiche aziendali ad anagrafica, tutor e documenti aggiornano le viste personali senza duplicazioni.
- Proiezione didattica sintetica condivisa per materie e calendario. Comunicazioni rivolte allo studente distinte da note interne.

Il dataset demo completo è nel bundle pubblico: questo filtro client **non protegge dati reali**. Non è attivato Supabase Auth, non sono installate policy RLS e non esistono ancora autorizzazioni server per questo flusso. Piani, lezioni ed esami sono sintetici; documenti senza allegati, nessun invio reale di notifiche. La lettura delle comunicazioni è uno stato locale del portale, azzerato all’uscita dal portale o reload.

## Architettura di produzione richiesta, non ancora attivata

### Identità e autorizzazione

Supabase Auth autenticherà gli account personali. Un adapter del servizio Auth risolverà un contesto utente dal server con ruolo, stato attivo e collegamenti a studente/tutor. L’UI riceverà soltanto capacità necessarie e dati autorizzati.

Le assegnazioni di ruolo devono risiedere in dati amministrati dal server, non in `user_metadata` modificabile dall’utente. Se saranno usati claim `app_metadata`, bisognerà considerare la scadenza dei JWT e verificare le revoche nel server per le operazioni sensibili. Nessuna promozione del ruolo tramite registrazione pubblica o aggiornamento del proprio profilo.

Ogni endpoint/RPC verifica identità, ruolo, risorsa e azione. Le verifiche di route sono soltanto UX; nessun filtro ricevuto dal browser amplia il perimetro. Le liste, i conteggi, gli export e i file rispettano le stesse regole dei dettagli.

### Unica anagrafica e relazioni

Prima dell’integrazione va letto e mappato lo schema esistente. I nomi seguenti descrivono relazioni logiche, non nuove tabelle da creare automaticamente:

- Identità Auth → profilo applicativo → ruolo e stato attivo.
- Identità Studente → una riga dell’anagrafica studenti.
- Identità Tutor → tutor → assegnazioni ai propri studenti.
- Piani, materie, lezioni, documenti, esami e comunicazioni → studente o iscrizione tramite chiavi esterne.
- Eventuali lezioni di gruppo richiedono una relazione partecipanti, verificata per ciascuno studente.

La consultazione personale usa la stessa riga letta dalla segreteria. Il repository reale deve interrogare soltanto il perimetro autorizzato; è vietato scaricare l’intera anagrafica e poi filtrarla nel browser.

### Matrice RLS da applicare dopo la verifica dello schema

| Risorsa | Studente | Tutor | Personale |
| --- | --- | --- | --- |
| Anagrafica | SELECT della sola riga collegata all’identità | SELECT studenti assegnati, campi pertinenti | Capacità del settore; aggiornamento Admin/Segreteria |
| Piano, materie, lezioni, esami | SELECT relazioni del proprio percorso | Assegnazioni e attività autorizzate | Segreteria/Didattica secondo capacità |
| Documenti e file | Solo metadati e file personali autorizzati | Nessun accesso generale ai documenti | Segreteria/Admin e soli operatori autorizzati |
| Comunicazioni | Solo destinatario personale e contenuti rivolti allo studente | Solo relazioni autorizzate | Note interne escluse dal DTO studente |
| Contratti e pagamenti | Non esposti nell’attuale portale Studente | Nessun accesso | Admin/Amministrazione |
| Ruoli e operatori | Nessuna modifica | Nessuna modifica | Operazioni amministrative privilegiate |
| Audit | Non applicabile | Non applicabile | SELECT nel perimetro esplicito, nessuna scrittura |

RLS abilitata su ogni tabella esposta, con privilegi minimi e negazione predefinita. Per lo studente, la condizione lega `auth.uid()` all’associazione server con la riga studente; le tabelle figlie ereditano il vincolo mediante relazioni verificabili. `TO authenticated` da solo non limita le righe.

Le operazioni UPDATE autorizzate devono avere una corrispondente SELECT e controlli `USING`/`WITH CHECK`, impedendo cambi di proprietario o associazione. RLS controlla le righe: colonne sensibili vanno separate o protette da privilegi/API/DTO adeguati, senza usare SELECT indiscriminati. Le viste vanno configurate per rispettare RLS; evitare bypass tramite funzioni privilegiate.

Storage documentale privato con policy su bucket, oggetto e proprietario; download autorizzati o URL firmati di breve durata. Nessuna chiave `service_role` o segreta nel frontend; eventuali credenziali privilegiate sono esclusivamente server e non sostituiscono il controllo dell’utente richiedente.

### Verifiche necessarie prima dell’uso reale

Provare due identità studente distinte e un tutor assegnato/non assegnato. Verificare accesso diretto alle API, ID manomessi, JOIN, conteggi, export, file, scritture, riassegnazione proprietario, account sospesi e revoche. I test devono fallire anche ignorando completamente l’interfaccia. Una demo client superata non equivale a RLS verificata.

## Vincoli operativi attuali

Nessuna modifica al database Supabase, migrazione SQL, nuovo repository o pubblicazione ufficiale. Continuare tramite branch e PR; il merge richiede approvazione del committente. Questa ADR va preservata nei successivi sviluppi e ogni sua revisione richiede una nuova decisione esplicita.

## Verifiche della demo a due portali

`npm run build`, `npm run typecheck`, `npm test` e `git diff --check` superati. I test React/jsdom verificano gli otto accessi esistenti, tutte le sezioni dei menu, il blocco del portale errato e la compatibilità degli alias. Una seconda identità studente viene introdotta solo nel test per verificare il perimetro differente e il ripristino sicuro dell’associazione demo anche con scope alterato nel localStorage. Verificati anche aggiornamento anagrafica/tutor tra i portali, esclusione delle note interne e lettura delle comunicazioni personali.

`npm run test:browser -- --list` riconosce quattro prove desktop/mobile. La loro esecuzione visuale non è dichiarata superata: nell’ambiente della revisione precedente Chromium è stato bloccato prima dell’avvio dai permessi sui socket; questa restrizione non è stata aggirata. La verifica su Windows 11 e browser reale resta da completare. Nessun test ha attivato Supabase o modificato il database.

## Riferimenti verificati il 13 novembre 2026

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/changelog.md

Il changelog consultato non richiede cambi all’implementazione corrente, che non attiva API Supabase o CLI.
