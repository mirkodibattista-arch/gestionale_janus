# Piano dei test e applicazione controllata

## Validazione locale eseguita

La verifica iniziale ha usato PostgreSQL embedded PGlite 0.5.16, con schema staging ricostruito privatamente dai cataloghi e senza righe remote. Prima della pubblicazione, il runner è stato adattato a scaffolding sintetico (`fixtures.sql`) per escludere i dump interni; questa nuova variante ha ricevuto solo controlli statici, non una nuova esecuzione SQL, in rispetto del vincolo di pubblicazione. Gli esiti seguenti si riferiscono alla verifica iniziale, non certificano la nuova variante. Schema Auth minimo simulato: test di SQL/ACL/RLS, non un'istanza completa di GoTrue/PostgREST.

Dalla radice del repository:

```sh
npm ci --prefix supabase/tests/p1
npm test --prefix supabase/tests/p1
```

Il pacchetto di test ha dipendenza fissata e lockfile separato; non cambia le dipendenze dell'app. Il runner usa esclusivamente un database in memoria: nessuna credenziale o accesso rete database. Il runner pubblicato usa le sole strutture sintetiche necessarie a esercitare il contratto P1, con grant espliciti del test; non replica lo schema business reale. Il sistema locale non riproduce l'event trigger di piattaforma, tutte le impostazioni del servizio o tutti i trigger di business preesistenti.

Esiti verificati:

| Controllo | Esito locale |
| --- | --- |
| Migrazione senza consenso progetto | Rifiutata prima del DDL |
| Prima applicazione e seconda applicazione | Superate |
| Ripetizione dei seed | Nessun duplicato o evento audit superfluo |
| Revoca di un permesso e riapplicazione | La revoca non viene ripristinata dal seed |
| Otto ruoli: matrice esatta via RPC | Superata |
| RLS profilo proprio / visibilità Admin | Superata |
| anon senza accesso a profili/RPC | Superata |
| Ogni ruolo: scritture dirette, lettura RBAC e manomissione log | Negate |
| Ogni ruolo: operazioni accessi senza MFA | Negate |
| Sette ruoli non Admin con MFA: escalation ad Admin | Negata |
| Profili disattivati, email non verificata, account anonimi o bannati | Nessun permesso |
| Ruolo revocato e metadata contraffatti | Nessun permesso |
| Ultimo Admin: revoca e disattivazione | Negate |
| Admin con MFA: assegna/revoca altro ruolo e cambia stato profilo | Superate |
| Audit con MFA: consultazione limitata e tracciata | Superata |
| service_role: INSERT form sulle colonne già autorizzate | Riuscito e tracciato senza contenuto personale |
| PK/FK, unicità ruolo/permesso/associazioni, CHECK azioni e ambiti | Violazioni negate |
| Audit: limite superiore a 200 | Rifiutato |
| ROLLBACK dei test | Nessun utente sintetico residuo |
| Cinque tabelle business da ruoli non Admin | Accesso negato in P1 |

Il runner genera profili soltanto nel database locale effimero. `security.sql` è la stessa suite applicabile sullo staging dopo approvazione: crea fixture sintetiche dentro una transazione e termina con ROLLBACK. Non è stata eseguita su staging. È pensata per uno staging P1 appena predisposto, prima di provisioning reale; usa otto UUID riservati e richiede assenza di Admin applicativi preesistenti, poiché verifica il caso dell'unico Admin. Se lo staging è popolato, usare un ambiente isolato equivalente invece di adattare i conteggi per far passare i test.

## Prima applicazione futura: serve approvazione esplicita

1. Ottenere separatamente approvazione della matrice e dell'applicazione SQL sul solo progetto `rwaotjfhiyhndlgljuuo`. Push/PR non autorizzano una migrazione.
2. Rileggere schema, grant di colonna, policy, funzioni e trigger dello staging, confrontando la rilevazione approvata conservata privatamente. Controllare nella configurazione Data API che `private` non sia esposto. Verificare il contesto host/ref con un secondo controllo indipendente sul Dashboard.
3. Conservare un backup schema senza dati e un piano di recupero approvato; confermare che le sei tabelle non esistano e che nessuna automazione applichi automaticamente i file di migrazione. Non lanciare l'intera storia di main: include la migrazione del form già presente.
4. Usare una connessione amministrativa dedicata esclusivamente allo staging, con credenziali gestite fuori dal repository. Impostare nella stessa sessione `SET janus.approved_project='rwaotjfhiyhndlgljuuo';`, poi eseguire solo il file P1. Il gate non identifica l'host e non autorizza di per sé l'operazione. Mai impostarlo su una connessione all'originale.
5. Se un'istruzione fallisce: ROLLBACK e analisi; non saltare errori o rimuovere controlli. Il file è transazionale, non presenta operazioni concorrenti fuori transazione.
6. In una nuova sessione amministrativa dedicata allo staging, dopo specifica approvazione dei test sintetici, impostare lo stesso consenso ed eseguire `security.sql` con stop al primo errore. In psql utilizzare `-X -v ON_ERROR_STOP=1`; una sessione interrotta senza COMMIT non conserva le fixture. Chiudere la connessione dopo il test e verificare l'assenza degli UUID di fixture.
7. Rieseguire il file migrazione, verificare conteggi e catalogo, rileggere gli advisor; spiegare gli INFO intenzionali e trattare eventuali nuovi WARN. Nessuna prova con utenti reali in questa fase.
8. Registrare l'applicazione nella procedura di migrazione scelta dal team, senza reapplicare automaticamente le migrazioni storiche. Integrazione login/frontend e bootstrap richiedono approvazioni e lavoro successivi.

## Test necessari sul servizio reale, ancora da eseguire

- JWT scaduto/alterato, sub assente, refresh, logout/revoca sessione, recupero password, verifica email, MFA challenge e refresh del contesto UI.
- Via REST con publishable key: 401/403 o insiemi vuoti coerenti; RPC anon negate; schema private non raggiungibile; nessun privilegio derivato da claims client.
- Due connessioni amministrative simulate con utenti di test autorizzati: tentativo simultaneo di rimuovere/disattivare due Admin. La seconda transazione attende il lock e non lascia zero Admin. Ripetere con revoca ruolo da una sessione mentre l'altra tenta una funzione protetta.
- Race nella consultazione audit: coppia `(data,id)` senza perdite su timestamp uguali; limite massimo 200 e rifiuto di null/limiti fuori range; lettura log generata a ogni consultazione.
- Ripetere sullo staging le prove negative PK/FK, unicità e CHECK incluse nella suite; verificare anche eventuali vincoli e trigger aggiunti dopo la rilevazione.
- Dopo P2: due Studenti A/B, due Tutor con assegnazioni diverse, referenti condivisi, scadenza assegnazione, trasferimenti di ownership, letture e scritture finanziarie fuori ruolo. Non dichiarare questi scenari superati in P1: i mapping non esistono.
- Controllo bundle/frontend per escludere service_role e secret; prova mobile/desktop e regressione del form su branch del portale approvato.

## Recupero

Prima del COMMIT, qualunque errore annulla tutta la migrazione. Dopo un'applicazione riuscita preferire una migrazione correttiva revisionata: non esiste rollback distruttivo automatico che cancelli audit/profili. Se emergono accessi anomali, revocare temporaneamente EXECUTE sulle RPC P1 e SELECT su profili tramite intervento amministrativo approvato; preservare log ed evidenze. Un rollback dopo bootstrap o utilizzo richiede un piano specifico e non va eseguito con DROP CASCADE.
