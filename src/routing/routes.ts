import { campusModules, type CampusModuleId } from "../modules/registry";
import type { Role } from "../types/roles";

export const roleModules: Record<Role, readonly CampusModuleId[]> = {
  Admin: [
    "dashboard",
    "studenti",
    "tutor",
    "segreteria",
    "didattica",
    "amministrazione",
    "calendario",
    "attivita",
    "statistiche",
    "report",
    "operatori",
    "permessi",
    "impostazioni",
  ],
  Supervisore: [
    "dashboard",
    "studenti",
    "tutor",
    "segreteria",
    "didattica",
    "calendario",
    "attivita",
    "statistiche",
    "report",
  ],
  Segreteria: [
    "dashboard",
    "studenti",
    "iscrizioni",
    "segreteria",
    "documenti",
    "piano-studi",
    "esami",
    "calendario",
  ],
  Amministrazione: [
    "dashboard",
    "amministrazione",
    "contratti",
    "pagamenti",
    "scadenze",
    "report",
  ],
  Didattica: [
    "dashboard",
    "studenti",
    "tutor",
    "didattica",
    "calendario",
    "attivita",
    "materiali",
    "valutazioni",
    "statistiche",
  ],
  Tutor: [
    "dashboard",
    "studenti",
    "calendario",
    "attivita",
    "materiali",
    "valutazioni",
  ],
  Studente: [
    "dashboard",
    "profilo",
    "piano-studi",
    "calendario",
    "documenti",
    "esami",
    "il-mio-tutor",
  ],
  Audit: ["dashboard", "studenti", "attivita", "statistiche", "report"],
};
export type AppRoute =
  | { page: "home" }
  | { page: "login" }
  | { page: "not-found" }
  | { page: "campus"; moduleId: string };
export function parseRoute(hash: string): AppRoute {
  if (
    ["", "#", "#/", "#inizio", "#metodo", "#percorso", "#richiesta"].includes(
      hash,
    )
  )
    return { page: "home" };
  if (hash === "#/login") return { page: "login" };
  const campus = /^#\/campus\/([a-z-]+)$/.exec(hash);
  return campus
    ? { page: "campus", moduleId: campus[1] }
    : { page: "not-found" };
}
export function isModuleId(value: string): value is CampusModuleId {
  return Object.hasOwn(campusModules, value);
}
export function canAccessModule(
  role: Role,
  moduleId: string,
): moduleId is CampusModuleId {
  return isModuleId(moduleId) && roleModules[role].includes(moduleId);
}
export function moduleLabel(role: Role, id: CampusModuleId) {
  return role === "Tutor" && id === "studenti"
    ? "I miei studenti"
    : campusModules[id].label;
}
export const dashboardHash = "#/campus/dashboard";
export function navigate(hash: string) {
  window.location.hash = hash;
  window.scrollTo(0, 0);
}
