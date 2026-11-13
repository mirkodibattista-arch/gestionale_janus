# Login dimostrativo

Le istruzioni aggiornate, gli otto account e la password pubblica di prova sono in [README.md](../README.md#accessi-demo).

- Ruolo derivato dall'account; nessun selettore del ruolo.
- Digest SHA-256 nella fixture, nessuna password o hash salvati nella sessione.
- Sessione locale con scadenza a 8 ore; logout, storage corrotto e scadenza coperti dai test.
- Demo manipolabile dal browser, inadatta a dati reali.
- Recupero password mostra un avviso esplicito: nessun messaggio viene inviato.
- Il caricamento della demo non richiede chiavi Supabase.

Per stato dei moduli e limiti: [CAMPUS_IMPLEMENTATION.md](CAMPUS_IMPLEMENTATION.md).
