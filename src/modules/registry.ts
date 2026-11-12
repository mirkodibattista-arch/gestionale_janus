import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type CampusModuleId =
  | "dashboard"
  | "studenti"
  | "iscrizioni"
  | "tutor"
  | "segreteria"
  | "didattica"
  | "amministrazione"
  | "calendario"
  | "documenti"
  | "piano-studi"
  | "esami"
  | "materiali"
  | "valutazioni"
  | "profilo"
  | "il-mio-tutor"
  | "contratti"
  | "pagamenti"
  | "scadenze";
type CampusModule = {
  id: CampusModuleId;
  label: string;
  icon: LucideIcon;
  status: "demo" | "planned";
};
export const campusModules: Record<CampusModuleId, CampusModule> = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    status: "demo",
  },
  studenti: {
    id: "studenti",
    label: "Studenti",
    icon: Users,
    status: "planned",
  },
  iscrizioni: {
    id: "iscrizioni",
    label: "Iscrizioni",
    icon: ClipboardList,
    status: "planned",
  },
  tutor: {
    id: "tutor",
    label: "Tutor",
    icon: GraduationCap,
    status: "planned",
  },
  segreteria: {
    id: "segreteria",
    label: "Segreteria",
    icon: BookOpen,
    status: "planned",
  },
  didattica: {
    id: "didattica",
    label: "Didattica",
    icon: GraduationCap,
    status: "planned",
  },
  amministrazione: {
    id: "amministrazione",
    label: "Amministrazione",
    icon: WalletCards,
    status: "planned",
  },
  calendario: {
    id: "calendario",
    label: "Calendario",
    icon: CalendarDays,
    status: "planned",
  },
  documenti: {
    id: "documenti",
    label: "Documenti",
    icon: FileText,
    status: "planned",
  },
  "piano-studi": {
    id: "piano-studi",
    label: "Piano di studi",
    icon: BookOpen,
    status: "planned",
  },
  esami: {
    id: "esami",
    label: "Esami",
    icon: GraduationCap,
    status: "planned",
  },
  materiali: {
    id: "materiali",
    label: "Materiali",
    icon: FileText,
    status: "planned",
  },
  valutazioni: {
    id: "valutazioni",
    label: "Valutazioni",
    icon: ClipboardList,
    status: "planned",
  },
  profilo: {
    id: "profilo",
    label: "Il mio profilo",
    icon: Users,
    status: "planned",
  },
  "il-mio-tutor": {
    id: "il-mio-tutor",
    label: "Il mio tutor",
    icon: GraduationCap,
    status: "planned",
  },
  contratti: {
    id: "contratti",
    label: "Contratti",
    icon: FileText,
    status: "planned",
  },
  pagamenti: {
    id: "pagamenti",
    label: "Pagamenti",
    icon: WalletCards,
    status: "planned",
  },
  scadenze: {
    id: "scadenze",
    label: "Scadenze",
    icon: CalendarDays,
    status: "planned",
  },
};
