# Verifica prima della pubblicazione GitHub — 16 novembre 2026

Autorizzazione limitata a pubblicare `feat/janus-p1-auth-rbac-audit` e aprire una PR **Draft** verso `main`. Nessun permesso di migrare database, creare utenti, cambiare segreti, effettuare merge o avviare deployment.

## Perimetro controllato

Base remota `main`: `09b5e9cdd08b81b6811aca6345a625310444048d`, invariata rispetto alla preparazione. Branch P1 remoto assente prima della pubblicazione. La base e i file proposti non contengono workflow GitHub Actions, configurazioni di deploy nuove o modifiche al frontend.

Il commit usa il prefisso `[CF-Pages-Skip] [skip ci]`. Il primo è supportato dall'integrazione Cloudflare Pages per omettere il deployment; il secondo impedisce i workflow push/pull_request che rispettano il marcatore standard. Non sono state modificate impostazioni Cloudflare, webhooks, credenziali o integrazioni. Nessun comando di deployment viene eseguito.

Riferimento verificato: https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/#skipping-a-build-via-a-commit-message

## Controllo dei contenuti

- Scansione dei 19 file preparati prima di questo verbale: nessuna chiave privata, JWT, token GitHub, chiave Supabase, chiave AWS, URL con credenziali o assegnazione letterale di password/segreti rilevata.
- Gli unici indirizzi email nei file sono fixture `@example.invalid`. Nomi e telefoni delle fixture sono sintetici. I dump interni non sono inclusi nella pubblicazione. Restano la sola analisi riassuntiva richiesta e fixture sintetiche, senza righe delle anagrafiche, auth.users o eventi audit.
- I riferimenti ai progetti Supabase e al repository sono identificativi di destinazione, non credenziali.
- La scansione riguarda i nuovi contenuti del commit, non certifica l'intera storia preesistente del repository.
- Nessun file `.env`, archivio, node_modules o file CLI temporaneo è incluso nel commit.

## Verifiche eseguite in questa fase

`git diff --cached --check`: superato. `node --check supabase/tests/p1/local.mjs`: superato. JSON dei file nuovi: validi. Migrazione, suite security.sql, lockfile e matrice sono identici byte per byte al pacchetto P1 già consegnato e verificato. Il runner è stato adattato a fixture sintetiche: controllo sintattico JavaScript e revisione statica eseguiti; nuova esecuzione SQL non effettuata.

La suite SQL locale precedentemente eseguita è superata: gate del progetto, prima e seconda applicazione, assenza di duplicati, RLS/ruoli/MFA/integrità/audit, rollback delle fixture e conservazione delle revoche. Il log originale è in `validazione_locale.txt`.

Per rispettare il nuovo vincolo di non eseguire migrazioni SQL, in questa fase **non sono stati rilanciati né la migrazione né i test SQL**, nemmeno localmente. Nessuna connessione Supabase è necessaria per pubblicare questa proposta. I test sul servizio reale rimangono non eseguiti.

## Criticità ancora aperte

Mapping account–studente/tutor e policy dei moduli; configurazione Data API privata; Auth e REST reali; concorrenza multiconnessione; bootstrap Admin e MFA; retention/log degli eventi negati; approvazione della matrice. Dettagli in `rischi_e_decisioni.md` e `piano_test_e_rilascio.md`.

## Esclusione dei dump interni

Il primo tentativo di creare il tree remoto è stato rifiutato dal controllo automatico per il rischio di pubblicare metadati interni estesi senza autorizzazione specifica. Nessun dump è stato pubblicato. La proposta successiva esclude tutti e sei i JSON interni ed elimina la dipendenza del runner da tali file. I risultati della verifica iniziale sono conservati come storici, senza presentarli come esecuzione del runner modificato.
