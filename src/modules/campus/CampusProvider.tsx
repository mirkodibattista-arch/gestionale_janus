import { createContext, useContext, useState, type ReactNode } from "react";
import { useAuth } from "../auth/AuthProvider";
import { demoCampusRepository } from "../../services/campusRepository";
import {
  canAssign,
  canDocuments,
  canFinance,
  canManageStudents,
  canRecord,
  visibleStudents,
} from "./permissions";
import type { Activity, CampusData, Operator, Student, StudentDetails } from "./types";
function validStudentDetails(s: StudentDetails, data: CampusData, id?: string) {
  return s.name.trim().length >= 3 && s.name.length <= 80 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email) && s.email.length <= 160 &&
    !data.students.some(other => other.id !== id && other.email.toLowerCase() === s.email.toLowerCase()) &&
    s.phone.trim().length > 0 && s.phone.length <= 30 &&
    s.city.trim().length > 0 && s.city.length <= 80 &&
    s.region.trim().length > 0 && s.region.length <= 80 &&
    Number.isInteger(s.age) && s.age >= 14 && s.age <= 100 &&
    ["Attivo", "In iscrizione", "Sospeso"].includes(s.status) &&
    ["Diploma", "Recupero anni"].includes(s.path) &&
    ["Liceo scientifico", "Informatica", "Amministrazione e marketing"].includes(s.course) &&
    ["2025/26", "2026/27"].includes(s.year);
}
type Action =
  | { type: "student"; student: Student }
  | { type: "update-student"; id: string; details: StudentDetails }
  | { type: "assign"; id: string; tutorId: string }
  | { type: "document"; id: string }
  | { type: "payment"; id: string }
  | { type: "activity"; activity: Activity }
  | { type: "operator"; operator: Operator }
  | { type: "reset" };
type Context = { data: CampusData; mutate: (action: Action) => boolean };
const CampusContext = createContext<Context | null>(null);
export function CampusProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [data, setData] = useState(demoCampusRepository.load);
  const mutate = (a: Action) => {
    if (
      !session ||
      session.expiresAt <= Date.now() ||
      ["Audit", "Studente", "Supervisore"].includes(session.role)
    )
      return false;
    if (a.type === "reset") {
      if (session.role !== "Admin") return false;
      setData(demoCampusRepository.load());
      return true;
    }
    if ((a.type === "student" || a.type === "update-student") &&
      (!canManageStudents(session.role) || !validStudentDetails(
        a.type === "student" ? a.student : a.details,
        data, a.type === "student" ? undefined : a.id,
      ))) return false;
    if (a.type === "student" && (data.students.some(s => s.id === a.student.id) ||
      !data.tutors.some(t => t.id === a.student.tutorId))) return false;
    if ("id" in a && !data.students.some(s => s.id === a.id)) return false;
    if (
      a.type === "assign" &&
      (!canAssign(session.role) || !data.tutors.some((t) => t.id === a.tutorId))
    )
      return false;
    if (a.type === "document" && !canDocuments(session.role)) return false;
    if (a.type === "payment" && !canFinance(session.role)) return false;
    if (
      a.type === "operator" &&
      (session.role !== "Admin" || a.operator.id === session.user.id)
    )
      return false;
    if (
      a.type === "activity" &&
      (!canRecord(session.role) ||
        !visibleStudents(data, session).some(
          (s) => s.id === a.activity.studentId,
        ) ||
        !data.tutors.some((t) => t.id === a.activity.tutorId) ||
        a.activity.minutes < 0 ||
        a.activity.minutes > 480)
    )
      return false;
    setData((d) => {
      if (a.type === "activity")
        return { ...d, activities: [a.activity, ...d.activities] };
      if (a.type === "update-student")
        return { ...d, students: d.students.map(s => s.id === a.id ? { ...s, name: a.details.name, email: a.details.email,
          phone: a.details.phone, city: a.details.city, region: a.details.region,
          age: a.details.age, status: a.details.status, path: a.details.path,
          course: a.details.course, year: a.details.year } : s) };
      if (a.type === "operator")
        return {
          ...d,
          operators: d.operators.some((o) => o.id === a.operator.id)
            ? d.operators.map((o) => (o.id === a.operator.id ? a.operator : o))
            : [...d.operators, a.operator],
        };
      return {
        ...d,
        students:
          a.type === "student"
            ? [...d.students, a.student]
            : d.students.map((s) =>
                s.id !== a.id
                  ? s
                  : a.type === "assign"
                    ? { ...s, tutorId: a.tutorId }
                    : a.type === "document"
                      ? { ...s, documentReady: true }
                      : { ...s, balance: 0 },
              ),
      };
    });
    return true;
  };
  return (
    <CampusContext.Provider value={{ data, mutate }}>
      {children}
    </CampusContext.Provider>
  );
}
export function useCampus() {
  const c = useContext(CampusContext);
  if (!c) throw Error("CampusProvider richiesto");
  return c;
}
