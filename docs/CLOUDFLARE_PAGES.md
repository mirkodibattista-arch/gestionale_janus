# Configurazione futura Cloudflare Pages

Queste impostazioni sono un promemoria. La configurazione Cloudflare già esistente non è stata modificata e questa revisione non esegue deployment.

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

La Home è `/`, il modulo è `/orientamento`, il login è `/login` e i portali sono `/campus/dashboard` e `/campus/studente`. `public/_redirects`, copiato in `dist/_redirects`, conserva index.html come ingresso SPA per i percorsi diretti. Nessuna regola cambia la destinazione delle chiamate Supabase.

Il form pubblico continua a usare `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`: mantenere le impostazioni esistenti negli ambienti di anteprima e produzione. Non inserire chiavi segrete nel bundle. `VITE_AUTH_MODE=demo` riguarda esclusivamente gli account dimostrativi del campus; `disabled` disattiva quel login senza attivare Auth reale.

L’integrazione Git di Pages può creare deployment automaticamente su push e PR: abilitarla solo quando si decide di pubblicare. In questa revisione non sono aggiunti workflow di deployment, Wrangler o token Cloudflare.

Riferimenti ufficiali consultati il 13 novembre 2026:
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/
- https://developers.cloudflare.com/pages/configuration/build-configuration/

## Ambienti pianificati

| Ambiente | Branch | Stato di questa revisione |
| --- | --- | --- |
| Anteprima | Branch PR, per esempio feat/janus-public-home-login | Preparazione documentata; nessuna attivazione o pubblicazione |
| Produzione | main | Richiede approvazione del merge e successiva autorizzazione al deployment |

Mantenere build e variabili distinte per ambiente. Per i portali demo basta VITE_AUTH_MODE=demo; per il form restano necessarie le variabili Supabase esistenti. Prima di abilitare l’integrazione Git verificare le impostazioni dei deployment automatici e dei branch di anteprima: un push non deve causare una pubblicazione non autorizzata.

Riferimento aggiuntivo consultato: https://developers.cloudflare.com/pages/configuration/redirects/

## CORS esistente da verificare prima delle anteprime

La Edge Function nel repository consente solo i domini Janus e le origini locali sulla porta 5173. Non include localhost:5174 o host Pages. Controllare la configurazione effettivamente pubblicata prima di considerare verificato l’invio da anteprime/Pages; eventuali cambi delle origini richiedono autorizzazione esplicita. In questa PR funzione e configurazione Supabase restano invariate.
