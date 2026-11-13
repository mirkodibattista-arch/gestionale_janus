# Configurazione futura Cloudflare Pages

Queste impostazioni sono un promemoria: non è stato collegato né pubblicato il progetto.

| Impostazione | Valore previsto |
| --- | --- |
| Repository | mirkodibattista-arch/gestionale_janus |
| Framework | React (Vite) |
| Cartella radice | Radice del repository |
| Comando build | npm run build |
| Cartella output | dist |
| Branch produzione | main |
| Anteprime | Branch delle PR, da abilitare quando autorizzato |
| Variabile demo | VITE_AUTH_MODE=demo |

La demo usa route hash (`#/azienda/studenti` e `#/studente/profilo`): tutte le viste partono da `index.html`.
Non servono credenziali Supabase o segreti per questa versione. `VITE_AUTH_MODE=disabled` disattiva l’accesso demo, senza attivare automaticamente autenticazione reale.

L’integrazione Git di Pages può creare deployment automaticamente su push e PR: abilitarla solo quando si decide di pubblicare. In questa revisione non sono aggiunti workflow di deployment, Wrangler o token Cloudflare.

Riferimenti ufficiali consultati il 13 novembre 2026:
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/
- https://developers.cloudflare.com/pages/configuration/build-configuration/

## Ambienti pianificati

| Ambiente | Branch | Stato di questa revisione |
| --- | --- | --- |
| Anteprima | Branch PR, per esempio feat/janus-digital-campus-v1 | Preparazione documentata; nessuna attivazione o pubblicazione |
| Produzione | main | Richiede approvazione del merge e successiva autorizzazione al deployment |

Mantenere build e variabili distinte per ambiente. Per la demo corrente basta VITE_AUTH_MODE=demo; nessuna chiave Supabase. Prima di abilitare l’integrazione Git verificare le impostazioni dei deployment automatici e dei branch di anteprima: un push non deve causare una pubblicazione non autorizzata.
