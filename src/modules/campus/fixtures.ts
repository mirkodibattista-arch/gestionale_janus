import type { CampusData } from "./types";
import { demoAccounts } from "../auth/demoAccounts";
const names = [
  "Andrea Alba",
  "Sofia Brina",
  "Luca Cedro",
  "Giulia Duna",
  "Marco Edera",
  "Elena Faro",
  "Matteo Ginestra",
  "Alice Iris",
  "Davide Loto",
  "Chiara Marea",
  "Paolo Nube",
  "Sara Olmo",
  "Simone Pino",
  "Emma Quarzo",
  "Lorenzo Riva",
  "Anna Selce",
  "Nicola Tiglio",
  "Viola Ulivo",
  "Pietro Vento",
  "Gaia Zefiro",
  "Leo Ambra",
  "Marta Bosco",
  "Tommaso Corallo",
  "Irene Fiordo",
];
const locations = [
  ["Roma", "Lazio"],
  ["Milano", "Lombardia"],
  ["Napoli", "Campania"],
  ["Bologna", "Emilia-Romagna"],
  ["Torino", "Piemonte"],
  ["Bari", "Puglia"],
];
export function createFixtures(): CampusData {
  const students = names.map((name, i) => ({
    id: `ST-${String(i + 1).padStart(3, "0")}`,
    name,
    email: `studente${i + 1}@example.test`,
    phone: `+39 000 000 ${String(i + 1).padStart(4, "0")}`,
    city: locations[i % 6][0],
    region: locations[i % 6][1],
    age: 17 + (i % 12),
    status: (i % 9 === 0
      ? "In iscrizione"
      : i % 11 === 0
        ? "Sospeso"
        : "Attivo") as "Attivo" | "In iscrizione" | "Sospeso",
    path: i % 2 ? "Recupero anni" : "Diploma",
    course: ["Liceo scientifico", "Informatica", "Amministrazione e marketing"][
      i % 3
    ],
    year: i % 5 === 0 ? "2025/26" : "2026/27",
    tutorId: `TU-${(i % 3) + 1}`,
    progress: 25 + i * 3,
    documentReady: i % 4 !== 0,
    exam: "2027-06-15",
    balance: i % 3 === 0 ? 450 : 0,
    enrolled: `2026-${String([6, 6, 7, 7, 7, 8, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11][i]).padStart(2, "0")}-10`,
  }));
  return {
    students,
    communications: students.flatMap((s) => [
      {
        id: `${s.id}-C1`,
        studentId: s.id,
        audience: "studente" as const,
        title: "Benvenuto nel tuo percorso",
        body: `Il tuo percorso ${s.course} è consultabile nell’area personale.`,
        sender: "Segreteria JANUS",
        date: "2026-11-13",
      },
      {
        id: `${s.id}-C2`,
        studentId: s.id,
        audience: "studente" as const,
        title: "Calendario lezioni demo",
        body: "Consulta il calendario per le prossime lezioni dimostrative.",
        sender: "Didattica JANUS",
        date: "2026-11-13",
      },
      {
        id: `${s.id}-INT`,
        studentId: s.id,
        audience: "interno" as const,
        title: "Nota interna demo",
        body: "Promemoria operativo riservato agli operatori.",
        sender: "Operatore demo",
        date: "2026-11-13",
      },
    ]),
    tutors: [
      {
        id: "TU-1",
        name: "Claudia Aurora",
        subjects: ["Matematica", "Fisica"],
        email: "tutor1@example.test",
      },
      {
        id: "TU-2",
        name: "Riccardo Blu",
        subjects: ["Italiano", "Storia"],
        email: "tutor2@example.test",
      },
      {
        id: "TU-3",
        name: "Valentina Cielo",
        subjects: ["Inglese", "Informatica"],
        email: "tutor3@example.test",
      },
    ],
    activities: students.flatMap((s, i) => [
      {
        id: `AC-${i}`,
        studentId: s.id,
        tutorId: s.tutorId,
        type: (
          [
            "Telefonata",
            "Videochiamata",
            "WhatsApp",
            "Lezione",
            "Assenza",
          ] as const
        )[i % 5],
        date: `2026-${String(6 + (i % 6)).padStart(2, "0")}-${String(1 + (i % 12)).padStart(2, "0")}`,
        minutes: i % 5 === 4 ? 0 : 15 + (i % 4) * 15,
        note: "Attività di esempio sul percorso scolastico.",
      },
    ]),
    operators: demoAccounts.map((a) => ({
      id: a.id,
      name: a.displayName,
      email: a.email,
      role: a.role,
      active: a.active,
      created: "2026-11-13",
    })),
  };
}
