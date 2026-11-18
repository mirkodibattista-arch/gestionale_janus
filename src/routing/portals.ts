import { orientationPath } from "../../supabase/functions/_shared/janusOrientation";
import type { AuthSession } from "../modules/auth/types";
import type { Role } from "../types/roles";
import type { CampusModuleId } from "../modules/registry";

export type Portal = "azienda" | "studente";
export const portalForRole = (role: Role): Portal =>
  role === "Studente" ? "studente" : "azienda";
export const portalPath = (
  role: Role,
  moduleId: CampusModuleId = "dashboard",
) =>
  role === "Studente"
    ? moduleId === "dashboard"
      ? "/campus/studente"
      : `/campus/studente/${moduleId}`
    : `/campus/${moduleId}`;

export const sessionPath = (session: AuthSession) =>
  session.mode === "supabase" ? orientationPath : portalPath(session.role);
