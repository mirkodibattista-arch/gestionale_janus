import { ArrowRight } from "lucide-react";

export function PriorityTasks() {
  return (
    <section className="panel tasks-panel">
      <div className="panel-heading">
        <div>
          <h2>Pratiche da seguire</h2>
          <p>Una vista rapida delle priorità</p>
        </div>
        <button className="text-action">
          Apri elenco <ArrowRight size={14} />
        </button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>STUDENTE</th>
              <th>ATTIVITÀ</th>
              <th>REFERENTE</th>
              <th>SCADENZA</th>
              <th>STATO</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Alessio R.",
                "Documenti da verificare",
                "Segreteria",
                "Oggi",
                "Da verificare",
              ],
              [
                "Giulia M.",
                "Assegnazione tutor",
                "Didattica",
                "Domani",
                "In corso",
              ],
              [
                "Davide P.",
                "Rata mensile",
                "Amministrazione",
                "18 Nov",
                "In scadenza",
              ],
            ].map((r, i) => (
              <tr key={r[0]}>
                <td>
                  <span className={`student-avatar s${i}`}>
                    {r[0].slice(0, 1)}
                  </span>
                  {r[0]}
                </td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td>{r[3]}</td>
                <td>
                  <span className={`status status-${i}`}>{r[4]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
