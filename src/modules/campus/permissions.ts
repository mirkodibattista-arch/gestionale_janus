import type { AuthSession } from "../auth/types";
import type { CampusData, Student } from "./types";
export function visibleStudents(
  data: CampusData,
  session: AuthSession,
): Student[] {
  if (session.role === "Studente")
    return data.students.filter((s) => s.id === "ST-001");
  if (session.role === "Tutor")
    return data.students.filter((s) => s.tutorId === "TU-1");
  if (session.role === "Audit")
    return data.students.filter((s) =>
      ["ST-001", "ST-002", "ST-003", "ST-004", "ST-005", "ST-006"].includes(
        s.id,
      ),
    );
  return data.students;
}
export const canManageStudents = (role: string) =>
  ["Admin", "Segreteria"].includes(role);
export const canAssign = (role: string) =>
  ["Admin", "Didattica"].includes(role);
export const canRecord = (role: string) =>
  ["Admin", "Didattica", "Tutor"].includes(role);
export const canFinance = (role: string) =>
  ["Admin", "Amministrazione"].includes(role);
export const canDocuments = (role: string) =>
  ["Admin", "Segreteria"].includes(role);
