import { ChevronDown, Sparkles, X } from "lucide-react";
import type { Role } from "../../../types/roles";
import { roleStats } from "../data";

type DashboardWelcomeProps = {
  role: Role;
  onRoleChange: (role: Role) => void;
  onExit: () => void;
};

export function DashboardWelcome({
  role,
  onRoleChange,
  onExit,
}: DashboardWelcomeProps) {
  const dashboard = roleStats[role];
  return (
    <>
      <div className="dash-demo-alert">
        <Sparkles size={15} />
        <span>Anteprima dimostrativa</span>
        <span className="alert-dot">
          Tutti i valori e le attività sono inventati
        </span>
        <button onClick={onExit} aria-label="Esci dall'anteprima">
          <X size={15} />
        </button>
      </div>
      <div className="dash-welcome">
        <div>
          <div className="eyebrow">PANORAMICA · MERCOLEDÌ 11 NOVEMBRE</div>
          <h1>
            Buongiorno, Mirko <span>✦</span>
          </h1>
          <p>{dashboard.intro}</p>
        </div>
        <div className="role-picker">
          <span>Vista di ruolo</span>
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value as Role)}
            aria-label="Seleziona dashboard demo"
          >
            {Object.keys(roleStats).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>
      </div>
    </>
  );
}
