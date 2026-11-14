import { useState } from "react";
import { Download } from "lucide-react";
import type { AuthSession } from "../auth/types";
import { useCampus } from "../campus/CampusProvider";
import { visibleStudents } from "../campus/permissions";
import { Panel } from "../campus/ui";
export function exportCsv(filename: string, rows: (string | number)[][]) {
  const safe = (v: string | number) =>
    `"${String(v)
      .replace(/^[=+@-]/, "'")
      .replaceAll('"', '""')}"`;
  const blob = new Blob(
    ["\uFEFF" + rows.map((r) => r.map(safe).join(";")).join("\r\n")],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function AnalyticsModule({
  session,
  report = false,
}: {
  session: AuthSession;
  report?: boolean;
}) {
  const { data } = useCampus();
  const [tutor, setTutor] = useState("");
  const [from, setFrom] = useState("2026-06-01");
  const [to, setTo] = useState("2026-11-30");
  const students = visibleStudents(data, session).filter(
    (s) => !tutor || s.tutorId === tutor,
  );
  const ids = new Set(students.map((s) => s.id));
  const activities = data.activities.filter(
    (a) => ids.has(a.studentId) && a.date >= from && a.date <= to,
  );
  const enrolled = students.filter(
    (s) => s.enrolled >= from && s.enrolled <= to,
  );
  const groups = [
    ["Percorso", "path"],
    ["Indirizzo scolastico", "course"],
    ["Stato", "status"],
    ["Regione", "region"],
  ] as const;
  const types = [
    "Telefonata",
    "Videochiamata",
    "WhatsApp",
    "Lezione",
    "Assenza",
  ];
  return (
    <div className="cp-stack">
      <div className="cp-toolbar">
        <div className="cp-filters">
          <label>
            Dal
            <input
              aria-label="Statistiche dal"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            Al
            <input
              aria-label="Statistiche al"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <label>
            Tutor
            <select value={tutor} onChange={(e) => setTutor(e.target.value)}>
              <option value="">Tutti</option>
              {data.tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="cp-button primary"
          onClick={() =>
            exportCsv("JANUS_report_demo.csv", [
              ["Indicatore", "Valore"],
              ["Nuove iscrizioni", enrolled.length],
              ["Attività", activities.length],
              ...types.map((t) => [
                t,
                activities.filter((a) => a.type === t).length,
              ]),
            ])
          }
        >
          <Download size={16} /> Esporta report CSV
        </button>
      </div>
      <div className="cp-metrics">
        <article>
          <span>Studenti attivi · situazione attuale</span>
          <strong>
            {students.filter((s) => s.status === "Attivo").length}
          </strong>
        </article>
        <article>
          <span>Iscrizioni nel periodo</span>
          <strong>{enrolled.length}</strong>
        </article>
        <article>
          <span>Attività nel periodo</span>
          <strong>{activities.length}</strong>
        </article>
        <article>
          <span>Ore di contatto nel periodo</span>
          <strong>
            {(activities.reduce((n, a) => n + a.minutes, 0) / 60).toFixed(1)}
          </strong>
        </article>
      </div>
      {report && (
        <div className="cp-info">
          Il CSV contiene indicatori aggregati del periodo e dei tutor
          selezionati. Nessun documento reale viene generato.
        </div>
      )}
      <div className="cp-two">
        <Panel title="Attività per canale" subtitle="Filtrate per data e tutor">
          <div className="cp-horizontal">
            {types.map((t) => (
              <div key={t}>
                <span>{t}</span>
                <i
                  style={{
                    width: `${(activities.filter((a) => a.type === t).length / Math.max(1, activities.length)) * 100}%`,
                  }}
                />
                <b>{activities.filter((a) => a.type === t).length}</b>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Studenti per tutor"
          subtitle="Distribuzione attuale delle assegnazioni"
        >
          <div className="cp-list">
            {data.tutors.map((t) => (
              <div key={t.id}>
                <span>{t.name}</span>
                <b>{students.filter((s) => s.tutorId === t.id).length}</b>
              </div>
            ))}
          </div>
        </Panel>
        {groups.map(([title, key]) => (
          <Panel
            key={key}
            title={title}
            subtitle="Situazione attuale · perimetro selezionato"
          >
            <div className="cp-list">
              {Array.from(new Set(students.map((s) => s[key]))).map((v) => (
                <div key={v}>
                  <span>{v}</span>
                  <b>{students.filter((s) => s[key] === v).length}</b>
                </div>
              ))}
            </div>
          </Panel>
        ))}
        <Panel title="Distribuzione per età">
          <div className="cp-list">
            {[
              [0, 17],
              [18, 24],
              [25, 99],
            ].map(([min, max]) => (
              <div key={min}>
                <span>
                  {min === 0
                    ? "Minori di 18"
                    : max === 99
                      ? "25 e oltre"
                      : "18–24 anni"}
                </span>
                <b>
                  {students.filter((s) => s.age >= min && s.age <= max).length}
                </b>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Distribuzione geografica"
          subtitle="Mappa schematica · località fittizie, nessun indirizzo reale"
        >
          <svg
            viewBox="0 0 360 240"
            role="img"
            aria-label="Distribuzione geografica dimostrativa in Italia"
          >
            <path
              d="M99 20 143 27 162 43 144 66 161 91 178 112 187 136 222 155 248 165 260 190 242 190 219 172 210 199 194 213 179 204 194 180 177 158 154 137 146 109 121 85 97 68 81 39Z M79 133 91 152 82 180 69 171Z M153 217 194 213 179 233 154 234Z"
              fill="var(--cp-raised)"
              stroke="var(--cp-muted)"
            />
            {[
              ["Milano", 112, 40],
              ["Torino", 89, 49],
              ["Bologna", 139, 70],
              ["Roma", 159, 119],
              ["Napoli", 190, 146],
              ["Bari", 227, 144],
            ].map(([name, x, y]) => (
              <g key={name}>
                <circle cx={x} cy={y} r="5" fill="#49c7e6" />
                <text
                  x={Number(x) + 9}
                  y={Number(y) + 3}
                  fill="var(--cp-text)"
                  fontSize="9"
                >
                  {name}: {students.filter((s) => s.city === name).length}
                </text>
              </g>
            ))}
          </svg>
        </Panel>
      </div>
    </div>
  );
}
