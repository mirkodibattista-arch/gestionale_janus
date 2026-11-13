import { dashboardSummary } from "./summary";
import { useState } from "react";
import { ArrowUpRight, GraduationCap, ArrowRight, ArrowLeftRight } from "lucide-react";
import { portalPath } from "../../routing/portals";
import type { AuthSession } from "../auth/types";
import { useCampus } from "../campus/CampusProvider";
import { visibleStudents } from "../campus/permissions";
import { Badge, Panel, Progress } from "../campus/ui";
import { canAccessModule } from "../../routing/routes";
export function CampusOverview({ session }: { session: AuthSession }) {
  const { data } = useCampus();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const destination = portalPath(
    session.role,
    canAccessModule(session.role, "studenti") ? "studenti" : "amministrazione",
  );
  const students = visibleStudents(data, session);
  const ids = new Set(students.map((s) => s.id));
  const activities = data.activities.filter((a) => ids.has(a.studentId));
  const {
    title,
    description,
    metrics: stats,
    actions,
  } = dashboardSummary(data, session);
  const months = ["Giu", "Lug", "Ago", "Set", "Ott", "Nov"];
  const bars = months.map(
    (_, i) =>
      students.filter((s) =>
        s.enrolled.startsWith(`2026-${String(i + 6).padStart(2, "0")}`),
      ).length,
  );
  const max = Math.max(1, ...bars);
  return (
    <div className="cp-stack">
      <div className="cp-welcome">
        <div>
          <span className="cp-eyebrow">
            IL FUTURO SI COSTRUISCE, OGNI GIORNO
          </span>
          <h2>{title}</h2>
          <p>{description}</p>
          <a className="cp-button primary" href={destination}>
            Esplora i percorsi <ArrowRight size={16} />
          </a>
        </div>
        <div className="cp-orbit" aria-hidden="true">
          <div />
          <GraduationCap size={65} />
          <span>
            JANUS
            <br />
            <b>CONNECTED CAMPUS</b>
          </span>
        </div>
      </div>
      <div className="cp-metrics">
        {stats.map(([label, value, Icon, caption]) => (
          <article key={label}>
            <div>
              <span>{label}</span>
              <Icon size={20} />
            </div>
            <strong>{value.toString().padStart(2, "0")}</strong>
            <small>
              <span className="cp-dot" /> {caption}
            </small>
          </article>
        ))}
      </div>
      <Panel
        title={
          session.role === "Audit" || session.role === "Supervisore"
            ? "Monitoraggio del campus"
            : "Priorità del tuo reparto"
        }
        subtitle="Indicatori aggiornati dai dati demo condivisi"
      >
        <div className="cp-priorities">
          {actions.map((action) => (
            <a key={action.moduleId} href={action.href}>
              <span className="cp-priority-count">{action.count}</span>
              <span>
                <b>{action.title}</b>
                <small>{action.detail}</small>
              </span>
              <ArrowUpRight size={18} />
            </a>
          ))}
        </div>
      </Panel>
      <div className="cp-dashboard-grid">
        <Panel
          title="Il campus cresce"
          subtitle="Iscrizioni per mese · giugno–novembre 2026"
          action={
            canAccessModule(session.role, "statistiche") ? (
              <a className="cp-link" href="/campus/statistiche">
                Analytics <ArrowUpRight size={14} />
              </a>
            ) : undefined
          }
        >
          <div className="cp-bars">
            {bars.map((n, i) => (
              <button
                key={i}
                onClick={() => setSelectedMonth(i)}
                aria-pressed={selectedMonth === i}
                title={`${months[i]}: ${n} iscrizioni`}
                aria-label={`${months[i]}: ${n} iscrizioni`}
              >
                <span>{n}</span>
                <i style={{ height: `${Math.max(4, (n / max) * 130)}px` }} />
                <small>{months[i]}</small>
              </button>
            ))}
          </div>
          {selectedMonth !== null && (
            <p role="status">
              {months[selectedMonth]} 2026: {bars[selectedMonth]} iscrizioni nel
              tuo perimetro.
            </p>
          )}
        </Panel>
        <Panel
          title="Attività recenti"
          subtitle="Il ritmo del tuo campus"
          action={
            canAccessModule(session.role, "attivita") ? (
              <a
                className="cp-link"
                aria-label="Apri registro attività"
                href="/campus/attivita"
              >
                <ArrowUpRight size={16} />
              </a>
            ) : undefined
          }
        >
          <div className="cp-timeline">
            {[...activities]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 4)
              .map((a) => (
                <div key={a.id}>
                  <span className="cp-timeline-dot" />
                  <div>
                    <b>{a.type}</b>
                    <p>{students.find((s) => s.id === a.studentId)?.name}</p>
                    <small>
                      {a.date} · {a.minutes} minuti
                    </small>
                  </div>
                  <Badge>Demo</Badge>
                </div>
              ))}
          </div>
        </Panel>
      </div>
      <Panel
        title="Percorsi in evidenza"
        subtitle="Una sola anagrafica, tutti i reparti allineati"
        action={
          <a className="cp-link" href={destination}>
            Visualizza tutti <ArrowRight size={14} />
          </a>
        }
      >
        <p className="cp-table-scroll-hint" id="cp-paths-scroll-hint">
          <ArrowLeftRight aria-hidden="true" size={14} />
          <span>Scorri lateralmente per tutte le colonne</span>
        </p>
        <div
          className="cp-table-scroll"
          role="region"
          aria-label="Percorsi in evidenza"
          aria-describedby="cp-paths-scroll-hint"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>Studente</th>
                <th>Indirizzo</th>
                <th>Tutor</th>
                <th>Progresso</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 4).map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="cp-avatar">
                      {s.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </span>{" "}
                    {s.name}
                  </td>
                  <td>{s.course}</td>
                  <td>{data.tutors.find((t) => t.id === s.tutorId)?.name}</td>
                  <td>
                    <Progress value={s.progress} />
                  </td>
                  <td>
                    <Badge>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
