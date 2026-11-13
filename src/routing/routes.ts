import { campusModules, type CampusModuleId } from "../modules/registry";
import type { Portal } from "./portals";
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
    "materie",
    "avanzamento",
    "comunicazioni",
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
  | { page: "orientation" }
  | { page: "login" }
  | { page: "not-found" }
  | { page: "campus"; moduleId: string; portal?: Portal };
export function parseRoute(input: string): AppRoute {
  // Compatibility with the hash links used by earlier campus versions.
  if (
    ["", "#", "#/", "#inizio", "#metodo", "#percorso", "#richiesta"].includes(
      input,
    )
  )
    return { page: "home" };
  if (input === "#/login") return { page: "login" };
  if (input.startsWith("#")) {
    const legacy = /^#\/(campus|azienda|studente)\/([a-z-]+)$/.exec(input);
    if (!legacy) return { page: "not-found" };
    return legacy[1] === "campus"
      ? { page: "campus", moduleId: legacy[2] }
      : { page: "campus", moduleId: legacy[2], portal: legacy[1] as Portal };
  }
  const path = input.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (path === "/") return { page: "home" };
  if (path === "/orientamento") return { page: "orientation" };
  if (path === "/login") return { page: "login" };
  if (path === "/campus/studente")
    return { page: "campus", portal: "studente", moduleId: "dashboard" };
  const student = /^\/campus\/studente\/([a-z-]+)$/.exec(path);
  if (student)
    return { page: "campus", portal: "studente", moduleId: student[1] };
  const staff = /^\/campus\/([a-z-]+)$/.exec(path);
  return staff
    ? { page: "campus", portal: "azienda", moduleId: staff[1] }
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
export const dashboardHash = "/campus/dashboard";
export function navigate(to: string, options: { replace?: boolean } = {}) {
  const url = new URL(to, window.location.href);
  if (url.origin !== window.location.origin) return;
  window.history[options.replace ? "replaceState" : "pushState"](
    null,
    "",
    url.pathname + url.search + url.hash,
  );
  window.dispatchEvent(new window.PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}
