import type { Role } from "../../types/roles";

export const roleStats: Record<
  Role,
  { intro: string; items: [string, string, string, string] }
> = {
  Admin: {
    intro: "Panoramica operativa dell’intero gestionale.",
    items: [
      "Studenti attivi",
      "Nuove iscrizioni",
      "Pagamenti ricevuti",
      "Tutor attivi",
    ],
  },
  Supervisore: {
    intro: "Monitoraggio delle attività e delle pratiche in corso.",
    items: [
      "Pratiche da verificare",
      "Iscrizioni in attesa",
      "Attività reparti",
      "Scadenze importanti",
    ],
  },
  Segreteria: {
    intro: "Pratiche scolastiche, documenti e percorsi degli studenti.",
    items: [
      "Studenti in gestione",
      "Documenti mancanti",
      "Piani di studio",
      "Esami programmati",
    ],
  },
  Amministrazione: {
    intro: "Rette, pagamenti e prossime scadenze.",
    items: [
      "Rette del periodo",
      "Pagamenti ricevuti",
      "Rate in sospeso",
      "Scadenze imminenti",
    ],
  },
  Didattica: {
    intro: "Assegnazioni, competenze tutor e supporto didattico.",
    items: [
      "Studenti assegnati",
      "Tutor disponibili",
      "Richieste materie",
      "Esami programmati",
    ],
  },
  Tutor: {
    intro: "Lezioni, materiali e studenti assegnati al tuo account demo.",
    items: [
      "Studenti assegnati",
      "Lezioni questa settimana",
      "Valutazioni da inserire",
      "Ore di tutoraggio",
    ],
  },
  Studente: {
    intro:
      "Il tuo percorso, le prossime lezioni e i traguardi verso il diploma.",
    items: [
      "Progresso formativo",
      "Materie completate",
      "Prossima lezione",
      "Obiettivo diploma",
    ],
  },
};
