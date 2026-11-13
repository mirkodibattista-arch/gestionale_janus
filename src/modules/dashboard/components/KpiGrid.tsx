import {
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  GraduationCap,
  Users,
  WalletCards,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import type { Role } from "../../../types/roles";
import { roleStats } from "../data";
import { roleValues } from "../demoData";

export function KpiGrid({ role }: { role: Role }) {
  const dashboard = roleStats[role];
  const numbers = roleValues[role];
  return (
    <div className="kpi-grid">
      {dashboard.items.map((title, i) => (
        <article className="kpi-card" key={title}>
          <div className="kpi-top">
            <span>{title}</span>
            <span className={i === 2 ? "kpi-icon green" : "kpi-icon"}>
              {
                [
                  <Users size={16} />,
                  <ClipboardList size={16} />,
                  role === "Admin" || role === "Amministrazione" ? (
                    <WalletCards size={16} />
                  ) : role === "Studente" ? (
                    <CalendarDays size={16} />
                  ) : (
                    <BookOpen size={16} />
                  ),
                  <GraduationCap size={16} />,
                ][i]
              }
            </span>
          </div>
          <strong>{numbers[i]}</strong>
          <div className="kpi-foot">
            <span className={i === 1 ? "kpi-change amber" : "kpi-change"}>
              {i === 1 ? (
                <ArrowDownRight size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}
              {i === 1 ? "Il tuo campus" : "Demo"}
            </span>
            <span>valore dimostrativo</span>
          </div>
        </article>
      ))}
    </div>
  );
}
