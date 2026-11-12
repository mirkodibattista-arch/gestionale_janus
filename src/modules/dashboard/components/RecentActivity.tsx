import { ArrowRight, Check } from "lucide-react";

export function RecentActivity() {
  return (
    <section className="panel activity-panel">
      <div className="panel-heading">
        <div>
          <h2>Attività recenti</h2>
          <p>Ultimi aggiornamenti</p>
        </div>
        <button className="dots">···</button>
      </div>
      {[
        {
          n: "LC",
          name: "Luca Conti",
          action: "ha completato l'invio documenti",
          time: "10 min fa",
          c: "blue",
        },
        {
          n: "MR",
          name: "Marta Riva",
          action: "ha richiesto un orientamento",
          time: "42 min fa",
          c: "cyan",
        },
        {
          n: "SG",
          name: "Sara Greco",
          action: "ha aggiornato un piano di studi",
          time: "1 ora fa",
          c: "purple",
        },
      ].map((a) => (
        <div className="activity-row" key={a.name}>
          <div className={`mini-avatar ${a.c}`}>{a.n}</div>
          <div className="activity-text">
            <b>{a.name}</b>
            <span>{a.action}</span>
            <small>{a.time}</small>
          </div>
          <span className="activity-check">
            <Check size={14} />
          </span>
        </div>
      ))}
      <button className="activity-link">
        Vedi tutte le attività <ArrowRight size={14} />
      </button>
    </section>
  );
}
