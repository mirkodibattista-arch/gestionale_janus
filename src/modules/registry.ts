import {
  BookOpen,
  ClipboardList,
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
  | "amministrazione";
type CampusModule = {
  id: CampusModuleId;
  label: string;
  icon: LucideIcon;
  status: "demo" | "planned";
  badge?: string;
};

// Catalogo di estensione, non una matrice di autorizzazione o di route attive.
// I moduli planned non implementano ancora operazioni sui dati.
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
    badge: "248",
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
};

// Ordine e voci visibili del prototipo su main, conservati in questa PR.
export const dashboardNavigation: CampusModuleId[] = [
  "dashboard",
  "studenti",
  "iscrizioni",
  "segreteria",
  "amministrazione",
  "didattica",
];
