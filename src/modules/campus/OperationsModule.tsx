import { useState, type FormEvent } from "react";
import type { AuthSession } from "../auth/types";
import type { CampusModuleId } from "../registry";
import { learningForStudent } from "./learning";
import { useCampus } from "./CampusProvider";
import {
  canAssign,
  canDocuments,
  canFinance,
  visibleStudents,
} from "./permissions";
import { Panel, Badge, Progress, money, dateLabel } from "./ui";
import { roles } from "../../types/roles";
import { roleModules } from "../../routing/routes";
export function OperationsModule({
  session,
  moduleId,
}: {
  session: AuthSession;
  moduleId: CampusModuleId;
}) {
  const { data, mutate } = useCampus();
  const students = visibleStudents(data, session);
  const [message, setMessage] = useState("");
  const notify = (ok: boolean, text: string) =>
    setMessage(ok ? text : "Operazione non autorizzata.");
  if (moduleId === "impostazioni")
    return (
      <Panel
        title="Ambiente dimostrativo"
        subtitle="Dati conservati in memoria fino al ricaricamento della pagina."
      >
        <p>
          Le prove non inviano dati a servizi esterni. L’integrazione Supabase
          verrà introdotta dopo la verifica dello schema.
        </p>
        <p>Le preferenze del tema rimangono solo in questo browser.</p>
        <button
          className="cp-button"
          onClick={() =>
            notify(mutate({ type: "reset" }), "Dati dimostrativi ripristinati.")
          }
        >
          Ripristina dati demo
        </button>
        <p role="status">{message}</p>
      </Panel>
    );
  if (moduleId === "permessi")
    return (
      <Panel
        title="Matrice di accesso"
        subtitle="Controlli dimostrativi nel browser. La protezione server e RLS è da implementare."
      >
        <div className="cp-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Ruolo</th>
                <th>Viste consentite</th>
                <th>Modifiche demo</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r}>
                  <td>{r}</td>
                  <td style={{ whiteSpace: "normal" }}>
                    {roleModules[r].join(", ")}
                  </td>
                  <td>
                    {r === "Audit" || r === "Studente" || r === "Supervisore"
                      ? "Sola consultazione"
                      : "Solo operazioni del proprio settore"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    );
  if (moduleId === "operatori") {
    const add = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const ok = mutate({
        type: "operator",
        operator: {
          id: crypto.randomUUID(),
          name: String(f.get("name")),
          email: String(f.get("email")),
          role: String(f.get("role")),
          active: true,
          created: "2026-11-13",
        },
      });
      notify(
        ok,
        "Operatore aggiunto alla simulazione; nessun account di accesso creato.",
      );
      if (ok) e.currentTarget.reset();
    };
    return (
      <div className="cp-stack">
        <Panel
          title="Team JANUS"
          subtitle="Gestione simulata. Le modifiche non cambiano gli account demo di login."
        >
          <form className="cp-form" onSubmit={add}>
            <label>
              Nome
              <input name="name" required maxLength={80} />
            </label>
            <label>
              Email demo
              <input name="email" type="email" required />
            </label>
            <label>
              Ruolo
              <select name="role">
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <button className="cp-button primary">
              Aggiungi operatore demo
            </button>
          </form>
          <p role="status">{message}</p>
        </Panel>
        <Panel title="Operatori">
          <div className="cp-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nome / email</th>
                  <th>Ruolo e settore</th>
                  <th>Creato</th>
                  <th>Stato</th>
                  <th>Gestione</th>
                </tr>
              </thead>
              <tbody>
                {data.operators.map((o) => (
                  <tr key={o.id}>
                    <td>
                      {o.name}
                      <small>{o.email}</small>
                    </td>
                    <td>
                      {o.id === session.user.id ? (
                        o.role
                      ) : (
                        <select
                          aria-label={`Ruolo ${o.name}`}
                          value={o.role}
                          onChange={(e) =>
                            mutate({
                              type: "operator",
                              operator: { ...o, role: e.target.value },
                            })
                          }
                        >
                          {roles.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>{dateLabel(o.created)}</td>
                    <td>
                      <Badge>{o.active ? "Attivo" : "Sospeso"}</Badge>
                    </td>
                    <td>
                      <button
                        className="cp-button"
                        disabled={o.id === session.user.id}
                        onClick={() =>
                          mutate({
                            type: "operator",
                            operator: { ...o, active: !o.active },
                          })
                        }
                      >
                        {o.active ? "Sospendi" : "Riattiva"}
                      </button>
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
  if (["tutor", "il-mio-tutor"].includes(moduleId))
    return (
      <div className="cp-two">
        {data.tutors
          .filter(
            (t) =>
              moduleId !== "il-mio-tutor" ||
              students.some((s) => s.tutorId === t.id),
          )
          .map((t) => (
            <Panel key={t.id} title={t.name} subtitle={t.email}>
              <div className="cp-tags">
                {t.subjects.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
              <strong className="cp-number">
                {students.filter((s) => s.tutorId === t.id).length}
              </strong>
              <p>Studenti assegnati visibili</p>
              <div className="cp-list">
                {students
                  .filter((s) => s.tutorId === t.id)
                  .map((s) => (
                    <div key={s.id}>
                      <span>{s.name}</span>
                      <Progress value={s.progress} />
                    </div>
                  ))}
              </div>
              <a className="cp-link" href="#/azienda/calendario">
                Consulta calendario →
              </a>
            </Panel>
          ))}
      </div>
    );
  if (
    ["amministrazione", "pagamenti", "contratti", "scadenze"].includes(moduleId)
  )
    return (
      <div className="cp-stack">
        <div className="cp-metrics">
          <article>
            <span>Saldo da ricevere</span>
            <strong>
              {money(students.reduce((n, s) => n + s.balance, 0))}
            </strong>
          </article>
          <article>
            <span>Rate aperte</span>
            <strong>{students.filter((s) => s.balance > 0).length}</strong>
          </article>
          <article>
            <span>Contratti dimostrativi</span>
            <strong>{students.length}</strong>
          </article>
        </div>
        <Panel
          title="Situazione economica"
          subtitle="Contratti e rate sintetici · scadenza demo 30 novembre 2026"
        >
          <div className="cp-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Studente / contratto</th>
                  <th>Rata aperta</th>
                  <th>Scadenza</th>
                  <th>Stato</th>
                  <th>Operazione demo</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.name}
                      <small>CT-{s.id}</small>
                    </td>
                    <td>{money(s.balance)}</td>
                    <td>30 nov 2026</td>
                    <td>
                      <Badge>{s.balance ? "In scadenza" : "Saldato"}</Badge>
                    </td>
                    <td>
                      {canFinance(session.role) && s.balance > 0 && (
                        <button
                          className="cp-button"
                          onClick={() => mutate({ type: "payment", id: s.id })}
                        >
                          Registra saldo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    );
  if (moduleId === "calendario")
    return (
      <Panel
        title="Agenda del campus"
        subtitle="Programmazione sintetica collegata agli studenti visibili"
      >
        <div className="cp-list">
          {students.flatMap((s) =>
            learningForStudent(data, s).lessons.map((lesson) => (
              <div key={lesson.id}>
                <span>
                  <b>
                    {s.name} · {lesson.subject}
                  </b>
                  <small>
                    {dateLabel(lesson.date)} · {lesson.time} ·{" "}
                    {lesson.tutorName}
                  </small>
                </span>
                <Badge>Programmata · demo</Badge>
              </div>
            )),
          )}
        </div>
      </Panel>
    );
  if (
    ["didattica", "piano-studi", "valutazioni", "materiali"].includes(moduleId)
  )
    return (
      <Panel
        title={
          moduleId === "materiali"
            ? "Materiale didattico demo"
            : "Percorsi e avanzamento"
        }
        subtitle={
          moduleId === "materiali"
            ? "Catalogo dimostrativo: nessun file didattico reale allegato."
            : "Piani sintetici e assegnazioni collegate all’anagrafica."
        }
      >
        <div className="cp-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Studente</th>
                <th>Piano / materie</th>
                <th>Tutor</th>
                <th>Avanzamento</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>
                    {s.course}
                    <small>
                      {learningForStudent(data, s)
                        .subjects.map((subject) => subject.name)
                        .join(" · ")}
                    </small>
                  </td>
                  <td>
                    {canAssign(session.role) ? (
                      <select
                        aria-label={`Tutor ${s.name}`}
                        value={s.tutorId}
                        onChange={(e) =>
                          mutate({
                            type: "assign",
                            id: s.id,
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
                    ) : (
                      data.tutors.find((t) => t.id === s.tutorId)?.name
                    )}
                  </td>
                  <td>
                    <Progress value={s.progress} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    );
  return (
    <Panel
      title={
        moduleId === "esami" ? "Sessioni d’esame" : "Pratiche di segreteria"
      }
      subtitle="Documenti, iscrizioni e scadenze del perimetro autorizzato. Certificati e attestati reali da implementare."
    >
      <div className="cp-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Studente</th>
              <th>Iscrizione / anno</th>
              <th>Documenti</th>
              <th>Esame</th>
              <th>Verifica demo</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>
                  {s.status}
                  <small>{s.year}</small>
                </td>
                <td>
                  <Badge>
                    {s.documentReady ? "Completo" : "Da verificare"}
                  </Badge>
                </td>
                <td>{dateLabel(s.exam)}</td>
                <td>
                  {canDocuments(session.role) && !s.documentReady && (
                    <button
                      className="cp-button"
                      onClick={() => mutate({ type: "document", id: s.id })}
                    >
                      Conferma documenti
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
