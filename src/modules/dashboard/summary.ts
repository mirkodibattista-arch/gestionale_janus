import {
  Activity,
  FileCheck2,
  GraduationCap,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AuthSession } from "../auth/types";
import type { CampusData } from "../campus/types";
import type { CampusModuleId } from "../registry";
import { visibleStudents } from "../campus/permissions";
import { money } from "../campus/ui";
import { canAccessModule } from "../../routing/routes";
import { portalPath } from "../../routing/portals";

export type DashboardMetric = readonly [
  string,
  number | string,
  LucideIcon,
  string,
];
type Action = {
  moduleId: CampusModuleId;
  title: string;
  detail: string;
  count: number | string;
};

export function dashboardSummary(data: CampusData, session: AuthSession) {
  const students = visibleStudents(data, session);
  const ids = new Set(students.map((s) => s.id));
  const activities = data.activities.filter((a) => ids.has(a.studentId));
  const pendingDocuments = students.filter((s) => !s.documentReady).length;
  const enrolling = students.filter((s) => s.status === "In iscrizione").length;
  const suspended = students.filter((s) => s.status === "Sospeso").length;
  const openPayments = students.filter((s) => s.balance > 0).length;
  const average = students.length
    ? Math.round(students.reduce((n, s) => n + s.progress, 0) / students.length)
    : 0;
  const lessons = activities.filter((a) => a.type === "Lezione").length;
  const absences = activities.filter((a) => a.type === "Assenza").length;
  const tutors = new Set(students.map((s) => s.tutorId)).size;
  const exams = students.filter((s) => s.exam).length;
  let title = "Ogni percorso conta.";
  let description =
    "Una visione condivisa. Le persone al centro del tuo campus.";
  let metrics: readonly DashboardMetric[] = [
    [
      "Studenti attivi",
      students.filter((s) => s.status === "Attivo").length,
      Users,
      "Nel tuo perimetro",
    ],
    ["Tutor di riferimento", tutors, GraduationCap, "Percorsi connessi"],
    [
      "Attività registrate",
      activities.length,
      Activity,
      "Contatti e lezioni demo",
    ],
    [
      "Documenti completi",
      students.length - pendingDocuments,
      FileCheck2,
      "Pratiche verificate",
    ],
  ];
  let actions: Action[] = [
    {
      moduleId: "segreteria",
      title: "Documenti da verificare",
      count: pendingDocuments,
      detail: "Apri le pratiche di segreteria",
    },
    {
      moduleId: "studenti",
      title: "Iscrizioni in lavorazione",
      count: enrolling,
      detail: "Consulta l’anagrafica condivisa",
    },
    {
      moduleId: "amministrazione",
      title: "Rate aperte",
      count: openPayments,
      detail: "Consulta i saldi dimostrativi",
    },
  ];
  switch (session.role) {
    case "Supervisore":
      title = "Il campus, sotto controllo.";
      description =
        "Monitora percorsi, criticità e attività dei reparti in sola consultazione.";
      metrics = [
        ["Iscrizioni in lavorazione", enrolling, Users, "Pratiche aperte"],
        ["Studenti sospesi", suspended, FileCheck2, "Situazioni da monitorare"],
        ["Avanzamento medio", `${average}%`, GraduationCap, "Indicatore demo"],
        [
          "Attività registrate",
          activities.length,
          Activity,
          "Nel tuo perimetro",
        ],
      ];
      actions = [
        actions[0],
        actions[1],
        {
          moduleId: "report",
          title: "Studenti monitorati",
          count: students.length,
          detail: "Apri il report del perimetro",
        },
      ];
      break;
    case "Segreteria":
      title = "Ogni pratica, al posto giusto.";
      description =
        "Iscrizioni, documenti e scadenze scolastiche dalla stessa anagrafica.";
      metrics = [
        ["Iscrizioni in lavorazione", enrolling, Users, "Da completare"],
        [
          "Documenti da verificare",
          pendingDocuments,
          FileCheck2,
          "Pratiche personali",
        ],
        ["Esami programmati demo", exams, GraduationCap, "Sessioni sintetiche"],
        [
          "Documenti completi",
          students.length - pendingDocuments,
          Activity,
          "Pratiche verificate",
        ],
      ];
      actions = [
        actions[0],
        { ...actions[1], moduleId: "iscrizioni" },
        {
          moduleId: "esami",
          title: "Programmazioni d’esame",
          count: exams,
          detail: "Consulta le sessioni demo",
        },
      ];
      break;
    case "Didattica":
      title = "Connetti competenze e percorsi.";
      description = "Coordina tutor, lezioni e avanzamento scolastico.";
      metrics = [
        ["Studenti seguiti", students.length, Users, "Anagrafica condivisa"],
        ["Tutor assegnati", tutors, GraduationCap, "Referenti dei percorsi"],
        ["Lezioni registrate", lessons, Activity, "Registro demo"],
        ["Assenze registrate", absences, FileCheck2, "Da monitorare"],
      ];
      actions = [
        {
          moduleId: "didattica",
          title: "Percorsi da coordinare",
          count: students.length,
          detail: "Consulta piani e assegnazioni",
        },
        {
          moduleId: "tutor",
          title: "Tutor coinvolti",
          count: tutors,
          detail: "Apri competenze e studenti assegnati",
        },
        {
          moduleId: "attivita",
          title: "Assenze da monitorare",
          count: absences,
          detail: "Apri il registro attività",
        },
      ];
      break;
    case "Tutor":
      title = "Il tuo spazio di tutoraggio.";
      description =
        "Concentrati sui tuoi studenti, sulle lezioni e sulle attività del percorso.";
      metrics = [
        [
          "I miei studenti",
          students.length,
          Users,
          "Solo assegnazioni personali",
        ],
        ["Lezioni registrate", lessons, GraduationCap, "Nel tuo perimetro"],
        ["Assenze registrate", absences, Activity, "Studenti assegnati"],
        ["Avanzamento medio", `${average}%`, FileCheck2, "Indicatore demo"],
      ];
      actions = [
        {
          moduleId: "studenti",
          title: "Studenti assegnati",
          count: students.length,
          detail: "Apri le schede personali",
        },
        {
          moduleId: "attivita",
          title: "Attività sul percorso",
          count: activities.length,
          detail: "Consulta o registra un’attività demo",
        },
        {
          moduleId: "calendario",
          title: "Percorsi in calendario",
          count: students.length,
          detail: "Apri le prossime lezioni sintetiche",
        },
      ];
      break;
    case "Amministrazione":
      title = "La situazione economica del campus.";
      description =
        "Contratti, rate e saldi simulati, senza effettuare pagamenti reali.";
      metrics = [
        [
          "Saldo da ricevere",
          money(students.reduce((n, s) => n + s.balance, 0)),
          FileCheck2,
          "Rate dimostrative",
        ],
        ["Rate aperte", openPayments, Activity, "Da verificare"],
        ["Contratti demo", students.length, Users, "Anagrafica condivisa"],
        [
          "Posizioni saldate",
          students.length - openPayments,
          GraduationCap,
          "Saldo a zero",
        ],
      ];
      actions = [
        {
          moduleId: "pagamenti",
          title: "Rate aperte",
          count: openPayments,
          detail: "Apri la situazione pagamenti demo",
        },
        {
          moduleId: "contratti",
          title: "Contratti dimostrativi",
          count: students.length,
          detail: "Consulta le posizioni sintetiche",
        },
        {
          moduleId: "scadenze",
          title: "Rate in scadenza demo",
          count: openPayments,
          detail: "Consulta le scadenze simulate",
        },
      ];
      break;
    case "Audit":
      title = "Una visione chiara, in sola lettura.";
      description =
        "Consulta esclusivamente gli studenti e le attività del perimetro autorizzato.";
      metrics = [
        ["Studenti autorizzati", students.length, Users, "Perimetro esplicito"],
        [
          "Attività consultabili",
          activities.length,
          Activity,
          "Solo studenti autorizzati",
        ],
        [
          "Documenti completi",
          students.length - pendingDocuments,
          FileCheck2,
          "Consultazione demo",
        ],
        ["Avanzamento medio", `${average}%`, GraduationCap, "Indicatore demo"],
      ];
      actions = [
        {
          moduleId: "studenti",
          title: "Studenti consultabili",
          count: students.length,
          detail: "Apri il perimetro Audit",
        },
        {
          moduleId: "attivita",
          title: "Attività consultabili",
          count: activities.length,
          detail: "Apri il registro in sola lettura",
        },
        {
          moduleId: "report",
          title: "Studenti nel report",
          count: students.length,
          detail: "Consulta i report autorizzati",
        },
      ];
      break;
  }
  return {
    title,
    description,
    metrics,
    actions: actions
      .filter((a) => canAccessModule(session.role, a.moduleId))
      .map((a) => ({ ...a, href: portalPath(session.role, a.moduleId) })),
  };
}
