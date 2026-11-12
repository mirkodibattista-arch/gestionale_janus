import {
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  GraduationCap,
  Users,
  WalletCards,
} from "lucide-react";
import type { Role } from "../../../types/roles";
import { roleStats } from "../data";

export function KpiGrid({ role }: { role: Role }) {
  const dashboard = roleStats[role];
  const numbers =
    role === "Admin" ? ["248", "18", "€ 42.850", "16"] : ["24", "8", "12", "6"];
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
                  <WalletCards size={16} />,
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
              {i === 1 ? "3 in verifica" : "+8,4%"}
            </span>
            <span>rispetto al mese scorso</span>
          </div>
        </article>
      ))}
    </div>
  );
}
