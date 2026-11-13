import type { AuthSession } from "../auth/types";
import type { CampusData, Student } from "./types";
export function visibleStudents(
  data: CampusData,
  session: AuthSession,
): Student[] {
  if (session.role === "Studente")
    return data.students.filter((s) => s.id === session.scope?.studentId);
  if (session.role === "Tutor")
    return data.students.filter(
      (s) =>
        Boolean(session.scope?.tutorId) && s.tutorId === session.scope?.tutorId,
    );
  if (session.role === "Audit")
    return data.students.filter(
      (s) => session.scope?.auditStudentIds?.includes(s.id) ?? false,
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
