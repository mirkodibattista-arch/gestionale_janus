import type { Role } from "../../../types/roles";
import { roleTasks } from "../demoData";
export function PriorityTasks({ role }: { role: Role }) {
  return (
    <section className="panel tasks-panel">
      <div className="panel-heading">
        <div>
          <h2>
            {role === "Tutor"
              ? "Studenti e prossime lezioni"
              : role === "Studente"
                ? "I tuoi prossimi passi"
                : "Attività da seguire"}
          </h2>
          <p>Una vista rapida delle tue priorità · dati fittizi</p>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {[
                role === "Studente" ? "MATERIA" : "VOCE",
                "ATTIVITÀ",
                "AREA",
                "SCADENZA",
                "STATO",
              ].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roleTasks[role].map((row, i) => (
              <tr key={row[0]}>
                <td>
                  <span className={`student-avatar s${i}`}>
                    {row[0].slice(0, 1)}
                  </span>
                  {row[0]}
                </td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td>
                  <span className={`status status-${i}`}>{row[4]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
