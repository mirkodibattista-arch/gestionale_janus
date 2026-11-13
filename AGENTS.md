# JANUS — requisiti permanenti di progetto

Leggere `docs/architecture/ADR-001-dual-portals.md` prima di modificare autenticazione, routing, dati, layout o permessi.

- Un’unica applicazione web, con Portale Aziendale e Portale Studente distinti.
- Una sola anagrafica studenti e, nell’architettura futura, un unico PostgreSQL condiviso. Non creare copie dei dati per i portali.
- Il ruolo e il perimetro dati derivano dall’identità autenticata. Nessun selettore manuale del ruolo e nessuna autorizzazione ricavata dall’email.
- Lo studente consulta esclusivamente il proprio percorso; Tutor e altri settori rispettano assegnazioni e capacità. Audit resta in sola lettura.
- In produzione: Supabase Auth, autorizzazione lato server e RLS; nascondere i pulsanti o filtrare nel browser non costituisce sicurezza.
- Per la fase corrente: solo fixture demo, nessuna modifica al database Supabase, migrazione SQL o pubblicazione ufficiale senza successiva autorizzazione esplicita.
- Lavorare sul repository esistente tramite branch e PR, preservando le funzionalità già presenti. Nessun merge senza approvazione.
- Verificare build e test pertinenti. Distinguere nei resoconti ciò che è demo, pianificato e realmente verificato.
