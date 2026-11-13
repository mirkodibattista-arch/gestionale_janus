import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import type { AuthSession } from "../auth/types";
import type { Student, StudentDetails } from "../campus/types";
import { StudentForm } from "./StudentForm";
import { useCampus } from "../campus/CampusProvider";
import {
  canAssign,
  canDocuments,
  canFinance,
  canManageStudents,
  visibleStudents,
} from "../campus/permissions";
import { Badge, Empty, Panel, Progress, dateLabel, money } from "../campus/ui";
export function StudentsModule({
  session,
  profile = false,
}: {
  session: AuthSession;
  profile?: boolean;
}) {
  const { data, mutate } = useCampus();
  const students = visibleStudents(data, session);
  const [selected, setSelected] = useState<string | null>(
    profile ? "ST-001" : null,
  );
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const filterKeys = ["status", "path", "course", "tutorId", "year"] as const;
  const filtered = students
    .filter(
      (s) =>
        [s.name, s.id, s.email, s.city].some(value => value.toLowerCase().includes(query.trim().toLowerCase())) &&
        filterKeys.every((k) => !filters[k] || s[k] === filters[k]),
    )
    .sort((a, b) => (ascending ? 1 : -1) * a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages);
  const student = students.find((s) => s.id === selected);
  const tutorName = (id: string) =>
    data.tutors.find((t) => t.id === id)?.name ?? "Da assegnare";
  const add = (details: StudentDetails) => {
    const s: Student = {
      id: `ST-${crypto.randomUUID().slice(0, 8)}`,
      ...details,
      tutorId: "TU-1",
      progress: 0,
      documentReady: false,
      exam: "2027-06-15",
      balance: 450,
      enrolled: "2026-11-13",
    };
    if (mutate({ type: "student", student: s })) {
      setAdding(false);
      setSelected(s.id);
      setMessage("Studente demo aggiunto alla sessione.");
      return true;
    }
    return false;
  };
  if (student)
    return (
      <div className="cp-stack">
        {!profile && <button className="cp-link" onClick={() => { setSelected(null); setEditing(false); setMessage(""); }}>
          <ArrowLeft size={16} /> Torna agli studenti
        </button>}
        <div className="cp-profile-head">
          <div className="cp-avatar large">
            {student.name
              .split(" ")
              .map((w) => w[0])
              .join("")}
          </div>
          <div>
            <h2>{student.name}</h2>
            <p>
              {student.id} · {student.course} · {student.year}
            </p>
          </div>
          <Badge>{student.status}</Badge>
        </div>
        {message && <p role="status">{message}</p>}
        {canManageStudents(session.role) && <button className="cp-button" onClick={() => setEditing(!editing)}>Modifica studente</button>}
        {editing && canManageStudents(session.role) && <Panel title="Modifica studente dimostrativo" subtitle="Le modifiche durano fino al ricaricamento.">
          <StudentForm student={student} onCancel={() => setEditing(false)} onSave={(details) => {
            const ok = mutate({ type: "update-student", id: student.id, details });
            if (ok) { setEditing(false); setMessage("Anagrafica demo aggiornata."); }
            return ok;
          }} />
        </Panel>}
        <div className="cp-two">
          <Panel title="Anagrafica e contatti">
            <dl>
              <dt>Email</dt>
              <dd>{student.email}</dd>
              <dt>Telefono demo</dt>
              <dd>{student.phone}</dd>
              <dt>Località</dt>
              <dd>
                {student.city} · {student.region}
              </dd>
              <dt>Età</dt>
              <dd>{student.age} anni</dd>
            </dl>
          </Panel>
          <Panel title="Iscrizione e percorso">
            <dl>
              <dt>Percorso</dt>
              <dd>{student.path}</dd>
              <dt>Indirizzo</dt>
              <dd>{student.course}</dd>
              <dt>Iscritto dal</dt>
              <dd>{dateLabel(student.enrolled)}</dd>
              <dt>Anno scolastico</dt>
              <dd>{student.year}</dd>
            </dl>
            <Progress value={student.progress} />
          </Panel>
          <Panel title="Tutor e piano di studi">
            <p>{tutorName(student.tutorId)}</p>
            {canAssign(session.role) && (
              <label>
                Assegna tutor
                <select
                  value={student.tutorId}
                  onChange={(e) =>
                    mutate({
                      type: "assign",
                      id: student.id,
                      tutorId: e.target.value,
                    })
                  }
                >
                  {data.tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="cp-list">
              {["Matematica", "Italiano", "Inglese"].map((m, i) => (
                <div key={m}>
                  <span>
                    {m} · recupero {i + 2}° anno
                  </span>
                  <Badge>{i < 2 ? "In corso" : "Da iniziare"}</Badge>
                </div>
              ))}
            </div>
          </Panel>
          {session.role !== "Tutor" && (
            <Panel title="Documenti ed esami">
              <p>
                Documento d’identità e titolo scolastico:{" "}
                <Badge>
                  {student.documentReady ? "Completo" : "Da verificare"}
                </Badge>
              </p>
              {canDocuments(session.role) && !student.documentReady && (
                <button
                  className="cp-button"
                  onClick={() => mutate({ type: "document", id: student.id })}
                >
                  Conferma verifica demo
                </button>
              )}
              <p>Esame di idoneità · {dateLabel(student.exam)}</p>
            </Panel>
          )}
          {canFinance(session.role) && (
            <Panel title="Contratto e pagamenti">
              <p>Contratto demo {student.id} · Recupero scolastico</p>
              <strong className="cp-number">{money(student.balance)}</strong>
              <p>Saldo ancora da versare</p>
              {student.balance > 0 && (
                <button
                  className="cp-button"
                  onClick={() => mutate({ type: "payment", id: student.id })}
                >
                  Registra saldo demo
                </button>
              )}
            </Panel>
          )}
          <Panel title="Storico attività e comunicazioni">
            <div className="cp-list">
              {data.activities
                .filter((a) => a.studentId === student.id)
                .map((a) => (
                  <div key={a.id}>
                    <span>
                      <b>{a.type}</b>
                      <small>
                        {dateLabel(a.date)} · {a.minutes} min · {a.note}
                      </small>
                    </span>
                  </div>
                ))}
            </div>
          </Panel>
        </div>
      </div>
    );
  return (
    <div className="cp-stack">
      <div className="cp-toolbar">
        <div className="cp-search">
          <Search size={17} />
          <input
            aria-label="Cerca studenti"
            placeholder="Nome, email, codice o città…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {canManageStudents(session.role) && (
          <button
            className="cp-button primary"
            onClick={() => setAdding(!adding)}
          >
            <Plus size={16} /> Nuovo studente
          </button>
        )}
      </div>
      {adding && (
        <Panel
          title="Nuovo studente dimostrativo"
          subtitle="Usa esclusivamente dati inventati."
        >
          <StudentForm onSave={add} onCancel={() => setAdding(false)} />
        </Panel>
      )}
      <div className="cp-filters">
        {filterKeys.map((k, i) => (
          <label key={k}>
            {["Stato", "Percorso", "Indirizzo", "Tutor", "Anno scolastico"][i]}
            <select
              value={filters[k] ?? ""}
              onChange={(e) => {
                setFilters({ ...filters, [k]: e.target.value });
                setPage(1);
              }}
            >
              <option value="">Tutti</option>
              {Array.from(new Set(students.map((s) => s[k]))).map((v) => (
                <option key={v} value={v}>
                  {k === "tutorId" ? tutorName(v) : v}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {(query || Object.values(filters).some(Boolean)) && <button className="cp-button" onClick={() => { setQuery(""); setFilters({}); setPage(1); }}>Azzera ricerca e filtri</button>}
      <Panel
        title="Anagrafica condivisa"
        subtitle={`${filtered.length} studenti demo · ${session.role === "Audit" ? "Perimetro autorizzato: 6 studenti" : "Dati coerenti tra i reparti"}`}
      >
        <div className="cp-table-scroll">
          <table>
            <thead>
              <tr>
                <th>
                  <button
                    className="cp-link"
                    onClick={() => setAscending(!ascending)}
                  >
                    Studente <ArrowUpDown size={13} />
                  </button>
                </th>
                <th>Percorso / indirizzo</th>
                <th>Tutor</th>
                <th>Avanzamento</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((current - 1) * 8, current * 8).map((s) => (
                <tr key={s.id}>
                  <td>
                    <button
                      className="cp-student-link"
                      onClick={() => setSelected(s.id)}
                    >
                      <span className="cp-avatar">
                        {s.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </span>
                      <span>
                        {s.name}
                        <small>
                          {s.id} · {s.city}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    {s.path}
                    <small>{s.course}</small>
                  </td>
                  <td>{tutorName(s.tutorId)}</td>
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
          {!filtered.length && <Empty />}
        </div>
        <div className="cp-pagination">
          <span>
            Pagina {current} di {pages}
          </span>
          <button
            className="cp-button"
            aria-label="Pagina precedente"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="cp-button"
            aria-label="Pagina successiva"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </Panel>
    </div>
  );
}
