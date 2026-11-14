import type { Role } from "../../types/roles";

export const roleValues: Record<Role, [string, string, string, string]> = {
  Audit: ["12", "24", "3", "6"],
  Admin: ["248", "18", "€ 42.850", "16"],
  Supervisore: ["24", "8", "12", "6"],
  Segreteria: ["248", "18", "32", "14"],
  Amministrazione: ["€ 49.600", "€ 42.850", "18", "9"],
  Didattica: ["186", "16", "11", "14"],
  Tutor: ["8", "14", "3", "22 h"],
  Studente: ["68%", "8 / 12", "14:30", "Giugno 2027"],
};
export const roleTasks: Record<
  Role,
  [string, string, string, string, string][]
> = {
  Audit: [],
  Admin: [
    [
      "Studente Demo 01",
      "Documenti da verificare",
      "Segreteria",
      "Oggi",
      "Da verificare",
    ],
    [
      "Studente Demo 02",
      "Assegnazione tutor",
      "Didattica",
      "Domani",
      "In corso",
    ],
    [
      "Studente Demo 03",
      "Rata dimostrativa",
      "Amministrazione",
      "Tra 3 giorni",
      "In scadenza",
    ],
  ],
  Supervisore: [
    [
      "Pratica Demo 01",
      "Verifica iscrizione",
      "Segreteria",
      "Oggi",
      "Da verificare",
    ],
    [
      "Pratica Demo 02",
      "Assegnazione tutor",
      "Didattica",
      "Domani",
      "In corso",
    ],
    [
      "Report Demo",
      "Riepilogo attività",
      "Coordinamento",
      "Venerdì",
      "Da completare",
    ],
  ],
  Segreteria: [
    [
      "Studente Demo 01",
      "Documento mancante",
      "Documenti",
      "Oggi",
      "Da ricevere",
    ],
    [
      "Studente Demo 02",
      "Conferma iscrizione",
      "Iscrizioni",
      "Domani",
      "In corso",
    ],
    [
      "Studente Demo 03",
      "Piano di studi",
      "Percorsi",
      "Venerdì",
      "Da verificare",
    ],
  ],
  Amministrazione: [
    [
      "Contratto Demo 01",
      "Rata dimostrativa",
      "Pagamenti",
      "Oggi",
      "In scadenza",
    ],
    [
      "Contratto Demo 02",
      "Verifica incasso",
      "Pagamenti",
      "Domani",
      "In corso",
    ],
    [
      "Contratto Demo 03",
      "Rinnovo contratto",
      "Contratti",
      "Venerdì",
      "Da verificare",
    ],
  ],
  Didattica: [
    [
      "Studente Demo 01",
      "Abbinamento tutor",
      "Matematica",
      "Oggi",
      "Da assegnare",
    ],
    [
      "Studente Demo 02",
      "Verifica progressi",
      "Italiano",
      "Domani",
      "In corso",
    ],
    [
      "Studente Demo 03",
      "Lezione di recupero",
      "Inglese",
      "Venerdì",
      "Pianificata",
    ],
  ],
  Tutor: [
    [
      "Studente Demo 01",
      "Equazioni e funzioni",
      "Matematica",
      "Oggi, 14:30",
      "Confermata",
    ],
    [
      "Studente Demo 02",
      "Analisi del testo",
      "Italiano",
      "Oggi, 16:00",
      "Confermata",
    ],
    [
      "Studente Demo 03",
      "Quiz modulo 3",
      "Matematica",
      "Domani",
      "Da valutare",
    ],
  ],
  Studente: [
    [
      "Matematica",
      "Equazioni e funzioni",
      "Lezione",
      "Oggi, 14:30",
      "In programma",
    ],
    ["Italiano", "Analisi del testo", "Materiale", "Domani", "Da consultare"],
    ["Storia", "Modulo 3", "Valutazione", "Completato", "Superato"],
  ],
};
export const roleCharts: Record<
  Role,
  {
    title: string;
    caption: string;
    legend: string;
    max: number;
    values: number[];
  }
> = {
  Audit: {
    title: "Attività autorizzate",
    caption: "Dati sintetici",
    legend: "Attività",
    max: 30,
    values: [2, 4, 6, 8, 10, 12],
  },
  Admin: {
    title: "Andamento iscrizioni",
    caption: "Nuove pratiche · ultimi 6 mesi",
    legend: "Nuove iscrizioni",
    max: 30,
    values: [12, 18, 15, 24, 21, 28],
  },
  Supervisore: {
    title: "Attività completate",
    caption: "Pratiche chiuse · ultimi 6 mesi",
    legend: "Pratiche completate",
    max: 40,
    values: [15, 18, 22, 29, 31, 36],
  },
  Segreteria: {
    title: "Pratiche di iscrizione",
    caption: "Pratiche completate · ultimi 6 mesi",
    legend: "Iscrizioni completate",
    max: 30,
    values: [9, 14, 17, 19, 24, 27],
  },
  Amministrazione: {
    title: "Incassi del periodo",
    caption: "Importi in migliaia di euro · dati sintetici",
    legend: "Incassi demo (migliaia €)",
    max: 50,
    values: [21, 27, 24, 35, 38, 43],
  },
  Didattica: {
    title: "Avanzamento didattico",
    caption: "Moduli completati · ultimi 6 mesi",
    legend: "Moduli completati",
    max: 100,
    values: [32, 43, 47, 66, 73, 86],
  },
  Tutor: {
    title: "Lezioni svolte",
    caption: "Il tuo tutoraggio · ultimi 6 mesi",
    legend: "Lezioni completate",
    max: 30,
    values: [9, 13, 17, 21, 24, 28],
  },
  Studente: {
    title: "Il tuo progresso",
    caption: "Percorso completato (%) · ultimi 6 mesi",
    legend: "Progresso (%)",
    max: 100,
    values: [12, 24, 35, 43, 56, 68],
  },
};
export const roleActivities: Record<Role, [string, string, string][]> = {
  Audit: [],
  Admin: [
    ["SE", "Segreteria", "ha completato una pratica demo"],
    ["DI", "Didattica", "ha aggiornato un’assegnazione demo"],
    ["AM", "Amministrazione", "ha registrato un incasso demo"],
  ],
  Supervisore: [
    ["SE", "Segreteria", "ha completato 4 pratiche demo"],
    ["DI", "Didattica", "ha aggiornato le assegnazioni demo"],
    ["CO", "Coordinamento", "ha preparato un report demo"],
  ],
  Segreteria: [
    ["DO", "Documenti", "nuovo documento dimostrativo disponibile"],
    ["IS", "Iscrizioni", "una richiesta demo è da verificare"],
    ["PS", "Piano di studi", "riepilogo demo aggiornato"],
  ],
  Amministrazione: [
    ["PA", "Pagamento demo", "registrazione fittizia completata"],
    ["SC", "Scadenze demo", "riepilogo settimanale disponibile"],
    ["CO", "Contratti demo", "nuovo rinnovo da verificare"],
  ],
  Didattica: [
    ["TU", "Tutor demo", "disponibilità aggiornata"],
    ["VA", "Valutazioni demo", "nuovo avanzamento disponibile"],
    ["AS", "Assegnazioni demo", "richiesta di supporto in matematica"],
  ],
  Tutor: [
    ["S1", "Studente Demo 01", "ha completato il quiz demo"],
    ["LE", "Lezione demo", "pianificata per oggi alle 14:30"],
    ["S2", "Studente Demo 02", "ha consultato il materiale demo"],
  ],
  Studente: [
    ["TU", "Il tuo tutor demo", "ha condiviso un materiale"],
    ["PR", "Il tuo percorso", "un modulo demo è completato"],
    ["LE", "Promemoria demo", "la prossima lezione è alle 14:30"],
  ],
};
