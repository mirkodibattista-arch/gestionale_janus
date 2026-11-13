import type { Role } from "../types/roles";
import type { CampusModuleId } from "../modules/registry";

export type Portal = "azienda" | "studente";
export const portalForRole = (role: Role): Portal =>
  role === "Studente" ? "studente" : "azienda";
export const portalHash = (
  role: Role,
  moduleId: CampusModuleId = "dashboard",
) => `#/${portalForRole(role)}/${moduleId}`;
