import { Check } from "lucide-react";
import type { Role } from "../../../types/roles";
import { roleActivities } from "../demoData";
export function RecentActivity({ role }: { role: Role }) {
  return (
    <section className="panel activity-panel">
      <div className="panel-heading">
        <div>
          <h2>Attività recenti</h2>
          <p>Aggiornamenti del tuo spazio demo</p>
        </div>
      </div>
      {roleActivities[role].map(([initials, name, action], i) => (
        <div className="activity-row" key={name}>
          <div className={`mini-avatar ${["blue", "cyan", "purple"][i]}`}>
            {initials}
          </div>
          <div className="activity-text">
            <b>{name}</b>
            <span>{action}</span>
            <small>{["10 min fa", "42 min fa", "1 ora fa"][i]}</small>
          </div>
          <span className="activity-check">
            <Check size={14} />
          </span>
        </div>
      ))}
    </section>
  );
}
