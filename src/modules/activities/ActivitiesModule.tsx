import { useState, type FormEvent } from "react";
import type { AuthSession } from "../auth/types";
import type { Activity } from "../campus/types";
import { useCampus } from "../campus/CampusProvider";
import { canRecord, visibleStudents } from "../campus/permissions";
import { Panel, Empty, dateLabel } from "../campus/ui";
export function ActivitiesModule({ session }: { session: AuthSession }) {
  const { data, mutate } = useCampus();
  const students = visibleStudents(data, session);
  const ids = new Set(students.map((s) => s.id));
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const activities = data.activities
    .filter((a) => ids.has(a.studentId) && (!type || a.type === type))
    .sort((a, b) => b.date.localeCompare(a.date));
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = students.find((s) => s.id === f.get("student"));
    if (!s) return;
    const activity: Activity = {
      id: crypto.randomUUID(),
      studentId: s.id,
      tutorId: session.role === "Tutor" ? "TU-1" : s.tutorId,
      type: String(f.get("type")) as Activity["type"],
      date: String(f.get("date")),
      minutes: Number(f.get("minutes")),
      note: String(f.get("note")).trim(),
    };
    if (mutate({ type: "activity", activity })) {
      setMessage("Attività registrata. Dashboard e statistiche aggiornate.");
      e.currentTarget.reset();
    }
  };
  return (
    <div className="cp-stack">
      {canRecord(session.role) && (
        <Panel
          title="Registra un’attività"
          subtitle="Aggiorna automaticamente i contatori della demo."
        >
          <form onSubmit={submit} className="cp-form">
            <label>
              Studente
              <select name="student">
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo
              <select name="type">
                {[
                  "Telefonata",
                  "Videochiamata",
                  "WhatsApp",
                  "Lezione",
                  "Assenza",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Data
              <input
                type="date"
                name="date"
                required
                defaultValue="2026-11-13"
              />
            </label>
            <label>
              Durata (minuti)
              <input
                type="number"
                name="minutes"
                min={0}
                max={480}
                defaultValue={30}
                required
              />
            </label>
            <label className="wide">
              Nota
              <input
                name="note"
                required
                maxLength={200}
                placeholder="Argomento, esito o prossimo passo"
              />
            </label>
            <button className="cp-button primary">
              Registra attività demo
            </button>
          </form>
          {message && <p role="status">{message}</p>}
        </Panel>
      )}
      <Panel
        title="Registro attività"
        subtitle={`${activities.length} attività visibili`}
        action={
          <select
            aria-label="Filtra tipo attività"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Tutti i tipi</option>
            {[
              "Telefonata",
              "Videochiamata",
              "WhatsApp",
              "Lezione",
              "Assenza",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        }
      >
        <div className="cp-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Studente</th>
                <th>Canale</th>
                <th>Data</th>
                <th>Durata</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td>{students.find((s) => s.id === a.studentId)?.name}</td>
                  <td>{a.type}</td>
                  <td>{dateLabel(a.date)}</td>
                  <td>{a.minutes} min</td>
                  <td>{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!activities.length && <Empty />}
        </div>
      </Panel>
    </div>
  );
}
