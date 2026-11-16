# Rischi e decisioni da approvare

## Prima di applicare P1

| Priorità | Rischio o decisione | Stato / trattamento proposto |
| --- | --- | --- |
| Bloccante | Qualsiasi scrittura remota | Autorizzati soltanto push/PR in bozza. Database staging e originale esclusi; nessuna scrittura DB eseguita |
| Bloccante | Identità del database | Il consenso `janus.approved_project` è un controllo operatore, non una prova dell'host. Verificare host/ref nella connessione e nel Dashboard prima di eseguire SQL; mai usare un database URL proveniente da input non verificato |
| Bloccante | API schema `private` | Confermare che non sia tra gli schemi esposti. Le RPC pubbliche sono invoker; le definer rimangono private. La configurazione API non è stata modificata né verificata via Dashboard |
| Bloccante per login operativo | Provisioning primo Admin | Non esistono profili nell'originale e non si creano utenti con P1. Occorre approvare un'identità Auth verificata, MFA e bootstrap manuale amministrativo. Nessuna credenziale predefinita e nessun primo iscritto auto-promosso |
| Bloccante per i moduli | Associazione account–studente/tutor | Assente nello staging. I permessi di modulo non aprono tabelle finché mapping e policy di riga non sono revisionati |
| Alta | Ultimo Admin utilizzabile | RPC proteggono ultimo profilo Admin attivo; un ban, cancellazione o modifica Auth fatta da operatori privilegiati può comunque rendere inutilizzabile l'ultimo account. Necessari almeno due Admin con MFA e procedura di recupero |
| Alta | Revoca di sessioni Auth | Controllo DB rende immediata la revoca ruolo/attivo e controlla ban/email; non valida auth.sessions.session_id a ogni richiesta. Un JWT firmato non scaduto può restare valido dopo logout se profilo e ruolo sono attivi. Definire durata JWT e procedura revoca; per garanzie più strette approvare controllo session_id sulle operazioni sensibili |
| Alta | Ambito Supervisore | Nessuna equivalenza tecnica con “80%”. Proposta: lettura operativa, senza contabilità, audit o gestione accessi. Confermare matrice CSV con il responsabile |
| Alta | Ruoli multipli | Permessi additivi. Decidere eventuale incompatibilità Studente/personale e ruolo primario per instradamento del portale |
| Alta | Proprietario DB / service_role | Owner e operatori privilegiati restano nel perimetro di fiducia e possono alterare oggetti/log. Audit non è immutabile rispetto al proprietario; eventuale copia append-only esterna richiede altro progetto |
| Media | Dati del log | Anche UUID e relazioni sono dati da proteggere. Approvare retention, soggetti autorizzati, paginazione, archiviazione e procedura di cancellazione; nessun job attivato |
| Media | Audit non universale | Sono coperti DML dei dieci oggetti previsti e lettura audit. Login falliti, azioni negate, rollback e letture generali richiedono fonti Auth/server separate |
| Media | Deriva dello schema | Prima applicazione rifiuta oggetti auth preesistenti senza marker; la riesecuzione sulla versione P1 è verificata, non è un motore di riparazione arbitraria. Rileggere cataloghi e ACL prima di ogni deploy, fermarsi per policy o grant estranei |
| Media | Disponibilità e carico audit | L'inserimento audit è sincrono: se fallisce, fallisce anche la scrittura applicativa. Misurare volume e dimensione indici; non configurata retention automatica |
| Media | Nomi RPC | Prefisso p1 evita collisioni con funzioni originali e rende esplicita l'integrazione frontend futura; prima del login definitivo decidere nomi stabili |

## Advisory in sola lettura

Originale: cinque INFO `rls_enabled_no_policy` sulle tabelle private RBAC/audit. In questo modello è intenzionale che i client non possano leggere direttamente tali tabelle: non si risolve aggiungendo `USING(true)`.

Staging: cinque INFO `rls_enabled_no_policy` sulle cinque tabelle applicative e due WARN per `public.rls_auto_enable()` SECURITY DEFINER con EXECUTE ereditato da PUBLIC (anon/authenticated). È una funzione event_trigger, per cui l'avviso di esecuzione RPC non prova che sia invocabile come una normale funzione. Va comunque revisionata e limitata separatamente; la P1 non la sostituisce, non altera l'event trigger di piattaforma e non dichiara risolto l'avviso.

Riferimenti di remediation:

- [RLS attiva senza policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
- [EXECUTE anon su SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [EXECUTE authenticated su SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)

## Decisioni già adottate nella proposta

Otto ruoli, nessun bypass implicito Admin, nessuna assegnazione automatica; email verificata e account non anonimo; MFA per gestione accessi e audit; no scritture dirette dei client; no export o cancellazioni massive; minimizzazione del log; scope propri/assegnati preparati ma non allargati a tutti; nessun trasferimento di dati dall'originale. Le nuove strutture mantengono nomi e tipi principali della base originale, ma non pretendono compatibilità con le sue funzioni non trasferite.
