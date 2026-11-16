# Specifica Pull Request in bozza

Titolo: `JANUS P1: prepara autenticazione, otto ruoli, permessi e audit per staging`

Base: `main` al commit `09b5e9cdd08b81b6811aca6345a625310444048d`.
Head: `feat/janus-p1-auth-rbac-audit`.
Stato previsto: **Draft**. Nessun merge, deploy o applicazione SQL automatica.

## Descrizione pronta

Lo staging JANUS non dispone delle sei tabelle applicative per profili, ruoli, permessi e audit. Questa proposta aggiunge una migrazione transazionale e rieseguibile, otto ruoli, 46 permessi granulari e 98 associazioni iniziali, mantenendo chiuse le tabelle dei moduli in attesa dei collegamenti account–studente/tutor e delle relative policy.

La gestione accessi richiede Admin attivo e MFA, protegge l'ultimo Admin e impedisce scritture dirette dei client. La lettura profili usa RLS, le autorizzazioni vengono risolte dal database, le RPC privilegiate sono private e il log registra soltanto chiavi tecniche. Audit legge tramite RPC con MFA e cursore composto. Nessun utente o segreto è incluso; frontend e form esistenti non cambiano.

La documentazione confronta main, la demo della PR #6 e i cataloghi dev/staging; include dipendenze, matrice CSV, rischi, piano test e procedura di applicazione soggetta ad approvazione. Il branch resta indipendente dalla PR #6. Nessun dump interno viene pubblicato; il runner pubblico usa fixture sintetiche.

Validazione: suite SQL eseguita in PostgreSQL embedded locale con catalogo staging ricostruito privatamente, fixture sintetiche e ROLLBACK; prima e seconda applicazione, assenza duplicati, revoche persistenti, controlli di ruolo/MFA/RLS e audit. `npm ci --prefix supabase/tests/p1 && npm test --prefix supabase/tests/p1`. Nessuna suite o migrazione eseguita sui database remoti. Dopo la sostituzione dei dump con fixture sintetiche sono stati effettuati solo controlli statici; il nuovo runner non è stato rieseguito, dato il divieto di eseguire SQL in questa fase. Auth reale, REST, concorrenza multiconnessione e mapping dei moduli restano da verificare prima del login operativo.

Richiesta di revisione: approvare matrice e scelte di sicurezza. La creazione della PR e l'applicazione allo staging sono azioni distinte. La PR, anche se approvata, non autorizza di per sé una modifica database.

## Autorizzazione di pubblicazione

Autorizzati soltanto push del branch e apertura della PR in bozza verso main. Nessun database o credenziale modificati, nessuna migrazione/test SQL rieseguiti in questa fase, nessun merge o deployment. Commit con prefisso `[CF-Pages-Skip] [skip ci]` per impedire build/deployment automatici. Le verifiche statiche di pubblicazione sono riportate in `verifica_pubblicazione.md`.
