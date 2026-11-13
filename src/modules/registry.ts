import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Users,
  WalletCards,
  ChartNoAxesCombined,
  Settings,
  ShieldCheck,
  History,
  type LucideIcon,
} from "lucide-react";
const entries = [
  ["dashboard", "Panoramica", LayoutDashboard],
  ["studenti", "Studenti", Users],
  ["tutor", "Tutor", GraduationCap],
  ["segreteria", "Segreteria", FileText],
  ["didattica", "Didattica", BookOpen],
  ["amministrazione", "Amministrazione", WalletCards],
  ["calendario", "Calendario", CalendarDays],
  ["attivita", "Registro attività", History],
  ["statistiche", "Statistiche", ChartNoAxesCombined],
  ["report", "Report", ClipboardList],
  ["operatori", "Operatori", Users],
  ["permessi", "Ruoli e permessi", ShieldCheck],
  ["impostazioni", "Impostazioni", Settings],
  ["iscrizioni", "Iscrizioni", ClipboardList],
  ["documenti", "Documenti", FileText],
  ["piano-studi", "Piano di studi", BookOpen],
  ["esami", "Esami", GraduationCap],
  ["materiali", "Materiali", FileText],
  ["valutazioni", "Valutazioni", ClipboardList],
  ["profilo", "Il mio profilo", Users],
  ["il-mio-tutor", "Il mio tutor", GraduationCap],
  ["contratti", "Contratti", FileText],
  ["pagamenti", "Pagamenti", WalletCards],
  ["scadenze", "Scadenze", CalendarDays],
] as const;
export type CampusModuleId = (typeof entries)[number][0];
export const campusModules = Object.fromEntries(
  entries.map(([id, label, icon]) => [id, { id, label, icon, status: "demo" }]),
) as Record<
  CampusModuleId,
  {
    id: CampusModuleId;
    label: string;
    icon: LucideIcon;
    status: "demo" | "planned";
  }
>;
