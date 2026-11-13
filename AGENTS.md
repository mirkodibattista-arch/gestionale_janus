# JANUS — requisiti permanenti di progetto

Leggere `docs/architecture/ADR-001-dual-portals.md` e `docs/architecture/ADR-002-public-home.md` prima di modificare autenticazione, routing, dati, layout o permessi.

- La Home pubblica con form di orientamento deve restare su `/`; il login è un percorso separato. Non modificare hook/payload/Edge Function/tabella del form senza autorizzazione esplicita. Una richiesta non è un’iscrizione confermata.
- Un’unica applicazione web, con Portale Aziendale e Portale Studente distinti.
- Una sola anagrafica studenti e, nell’architettura futura, un unico PostgreSQL condiviso. Non creare copie dei dati per i portali.
- Il ruolo e il perimetro dati derivano dall’identità autenticata. Nessun selettore manuale del ruolo e nessuna autorizzazione ricavata dall’email.
- Lo studente consulta esclusivamente il proprio percorso; Tutor e altri settori rispettano assegnazioni e capacità. Audit resta in sola lettura.
- In produzione: Supabase Auth, autorizzazione lato server e RLS; nascondere i pulsanti o filtrare nel browser non costituisce sicurezza.
- Per i portali riservati: fixture demo. Il form pubblico conserva la propria integrazione Supabase esistente; i test usano risposte simulate e non inviano dati al database. Nessuna modifica al database, migrazione SQL o pubblicazione ufficiale senza successiva autorizzazione esplicita.
- Lavorare sul repository esistente tramite branch e PR, preservando le funzionalità già presenti. Nessun merge senza approvazione.
- Verificare build e test pertinenti. Distinguere nei resoconti ciò che è demo, pianificato e realmente verificato.
