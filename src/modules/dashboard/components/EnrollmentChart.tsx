import { ChevronDown } from "lucide-react";

export function EnrollmentChart() {
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <h2>Andamento iscrizioni</h2>
          <p>Nuove pratiche · ultimi 6 mesi</p>
        </div>
        <button className="period-select">
          Questo semestre <ChevronDown size={14} />
        </button>
      </div>
      <div className="chart-area">
        <div className="chart-y">
          <span>30</span>
          <span>20</span>
          <span>10</span>
          <span>0</span>
        </div>
        <div className="chart-bars">
          {[
            { m: "Giu", v: 38 },
            { m: "Lug", v: 57 },
            { m: "Ago", v: 47 },
            { m: "Set", v: 74 },
            { m: "Ott", v: 62 },
            { m: "Nov", v: 88 },
          ].map((p) => (
            <div className="bar-group" key={p.m}>
              <div className="bar-wrap">
                <i className="bar pale" style={{ height: `${p.v * 0.55}%` }} />
                <i className="bar" style={{ height: `${p.v}%` }} />
              </div>
              <small>{p.m}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-legend">
        <span>
          <i /> Nuove iscrizioni
        </span>
        <span>
          <i /> Pratiche completate
        </span>
      </div>
    </section>
  );
}
