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
import type { Activity, CampusData, Operator, Student } from "./types";
type Action =
  | { type: "student"; student: Student }
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
    if (a.type === "student" && !canManageStudents(session.role)) return false;
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
