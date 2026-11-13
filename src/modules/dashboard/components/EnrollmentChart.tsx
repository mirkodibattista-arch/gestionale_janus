import type { Role } from "../../../types/roles";
import { roleCharts } from "../demoData";
const labels = ["Giu", "Lug", "Ago", "Set", "Ott", "Nov"];
export function EnrollmentChart({ role }: { role: Role }) {
  const chart = roleCharts[role];
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <h2>{chart.title}</h2>
          <p>{chart.caption}</p>
        </div>
        <span className="period-select">Esempio demo</span>
      </div>
      <div className="chart-area">
        <div className="chart-y">
          {[
            chart.max,
            Math.round((chart.max * 2) / 3),
            Math.round(chart.max / 3),
            0,
          ].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
        <div
          className="chart-bars"
          role="img"
          aria-label={`${chart.title}: ${chart.values.map((value, i) => `${labels[i]} ${value}`).join(", ")}`}
        >
          {chart.values.map((value, i) => (
            <div className="bar-group" key={labels[i]}>
              <div className="bar-wrap">
                <i
                  className="bar"
                  style={{ height: `${(value / chart.max) * 100}%` }}
                />
              </div>
              <small>{labels[i]}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-legend">
        <span>
          <i /> {chart.legend}
        </span>
      </div>
    </section>
  );
}
