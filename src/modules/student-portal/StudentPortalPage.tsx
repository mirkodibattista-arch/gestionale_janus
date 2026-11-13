import { useState } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import type { AuthSession } from "../auth/types";
import type { CampusModuleId } from "../registry";
import { campusModules } from "../registry";
import { useCampus } from "../campus/CampusProvider";
import { visibleStudents } from "../campus/permissions";
import { Badge, Panel, Progress, dateLabel } from "../campus/ui";
import { StudentLayout } from "../../layouts/StudentLayout";
import { portalHash } from "../../routing/portals";
import { learningForStudent } from "../campus/learning";

export function StudentPortalPage({
  session,
  moduleId,
}: {
  session: AuthSession;
  moduleId: CampusModuleId;
}) {
  const { data } = useCampus();
  const student = visibleStudents(data, session)[0];
  const [read, setRead] = useState<string[]>([]);
  if (!student)
    return (
      <StudentLayout activeModule={moduleId}>
        <h1>Profilo non disponibile</h1>
        <p>
          Nessun percorso associato a questo account demo. Contatta la
          segreteria.
        </p>
      </StudentLayout>
    );
  const { subjects, lessons, tutor } = learningForStudent(data, student);
  // Only explicitly student-facing content. Internal operator notes are excluded.
  const messages = data.communications.filter(
    (m) => m.studentId === student.id && m.audience === "studente",
  );
  const unread = messages.filter((m) => !read.includes(m.id)).length;
  const curriculum = (
    <div className="cp-list">
      {subjects.map((subject) => (
        <div key={subject.id}>
          <span>
            <b>{subject.name}</b>
            <small>{subject.year}</small>
          </span>
          <Progress value={subject.progress} />
        </div>
      ))}
    </div>
  );
  const agenda = (
    <div className="cp-list">
      {lessons.map((lesson) => (
        <div key={lesson.id}>
          <span>
            <b>{lesson.subject}</b>
            <small>
              {dateLabel(lesson.date)} · {lesson.time} · {lesson.tutorName}
            </small>
          </span>
          <Badge>Lezione demo</Badge>
        </div>
      ))}
    </div>
  );
  return (
    <StudentLayout activeModule={moduleId}>
      <div className="cp-page-head">
        <div>
          <span className="cp-eyebrow">IL MIO PERCORSO / JANUS</span>
          <h1>
            {moduleId === "dashboard"
              ? `Ciao, ${student.name.split(" ")[0]}.`
              : campusModules[moduleId].label}
          </h1>
          <p>
            {student.course} · {student.year} · Contenuti dimostrativi
          </p>
        </div>
        <Badge>Area personale demo</Badge>
      </div>
      {moduleId === "dashboard" ? (
        <div className="cp-stack">
          <section className="student-welcome">
            <span className="cp-eyebrow">
              UN PASSO ALLA VOLTA, VERSO IL DIPLOMA
            </span>
            <h2>Il tuo prossimo traguardo.</h2>
            <p>
              Lezioni, materie e documenti del tuo percorso, in un unico spazio.
            </p>
            <a
              className="cp-button primary"
              href={portalHash("Studente", "piano-studi")}
            >
              Apri il tuo piano <ArrowRight size={16} />
            </a>
          </section>
          <div className="cp-metrics">
            {([
              ["Avanzamento", `${student.progress}%`, GraduationCap],
              ["Materie", subjects.length, BookOpen],
              ["Lezioni demo", lessons.length, CalendarDays],
              ["Da leggere", unread, Bell],
            ] as const).map(([label, value, MetricIcon]) => {
              return (
                <article key={String(label)}>
                  <div>
                    <span>{String(label)}</span>
                    <MetricIcon size={20} />
                  </div>
                  <strong>{String(value)}</strong>
                  <small>Il tuo percorso personale</small>
                </article>
              );
            })}
          </div>
          <div className="cp-two">
            <Panel
              title="Le prossime lezioni"
              subtitle="Calendario sintetico condiviso con la demo aziendale"
            >
              {agenda}
            </Panel>
            <Panel title="Il tuo tutor di riferimento">
              <h3>{tutor?.name ?? "Da assegnare"}</h3>
              <p>{tutor?.subjects.join(" · ")}</p>
              <a
                className="cp-link"
                href={portalHash("Studente", "il-mio-tutor")}
              >
                Consulta il tutor →
              </a>
            </Panel>
          </div>
          <Panel title="Comunicazioni personali">
            <p>{unread} comunicazioni demo da leggere.</p>
            <a
              className="cp-link"
              href={portalHash("Studente", "comunicazioni")}
            >
              Apri comunicazioni →
            </a>
          </Panel>
        </div>
      ) : moduleId === "profilo" ? (
        <Panel
          title="Profilo personale"
          subtitle="Per richiedere una correzione, contatta la segreteria."
        >
          <dl>
            <dt>Nome</dt>
            <dd>{student.name}</dd>
            <dt>Email</dt>
            <dd>{student.email}</dd>
            <dt>Telefono</dt>
            <dd>{student.phone}</dd>
            <dt>Località</dt>
            <dd>
              {student.city} · {student.region}
            </dd>
            <dt>Percorso</dt>
            <dd>{student.path}</dd>
            <dt>Indirizzo</dt>
            <dd>{student.course}</dd>
            <dt>Anno scolastico</dt>
            <dd>{student.year}</dd>
          </dl>
        </Panel>
      ) : ["piano-studi", "materie"].includes(moduleId) ? (
        <Panel
          title={
            moduleId === "materie" ? "Le tue materie" : "Il tuo piano di studi"
          }
          subtitle="Piano sintetico dimostrativo, non una certificazione scolastica."
        >
          {curriculum}
        </Panel>
      ) : moduleId === "calendario" ? (
        <Panel
          title="Il tuo calendario lezioni"
          subtitle="Programmazione demo · nessuna videochiamata reale"
        >
          {agenda}
        </Panel>
      ) : moduleId === "il-mio-tutor" ? (
        <Panel
          title="Tutor assegnato"
          subtitle="Referente attualmente collegato alla tua anagrafica."
        >
          <h3>{tutor?.name ?? "Da assegnare"}</h3>
          <p>{tutor?.subjects.join(" · ")}</p>
          <p>{tutor?.email}</p>
        </Panel>
      ) : moduleId === "documenti" ? (
        <Panel
          title="I tuoi documenti"
          subtitle="Stati simulati: nessun allegato reale disponibile."
        >
          <div className="cp-list">
            {["Documento d’identità", "Titolo scolastico"].map((name) => (
              <div key={name}>
                <span>{name}</span>
                <Badge>
                  {student.documentReady ? "Completo" : "Da verificare"}
                </Badge>
              </div>
            ))}
          </div>
        </Panel>
      ) : moduleId === "esami" ? (
        <Panel
          title="Il tuo prossimo esame"
          subtitle="Sessione di esempio, da confermare con la segreteria."
        >
          <h3>Esame di idoneità</h3>
          <p>
            {dateLabel(student.exam)} · {student.course}
          </p>
          <Badge>Programmazione demo</Badge>
        </Panel>
      ) : moduleId === "avanzamento" ? (
        <Panel
          title="Avanzamento scolastico"
          subtitle="Indicatori dimostrativi: non costituiscono voti o crediti ufficiali."
        >
          <h3>Completamento del percorso</h3>
          <Progress value={student.progress} />
          {curriculum}
        </Panel>
      ) : moduleId === "comunicazioni" ? (
        <Panel
          title="Comunicazioni e notifiche"
          subtitle="Messaggi personali demo. Lo stato di lettura dura fino al logout o ricaricamento."
        >
          <div className="cp-list">
            {messages.map((m) => (
              <div key={m.id}>
                <span>
                  <b>{m.title}</b>
                  <small>
                    {dateLabel(m.date)} · {m.sender}
                  </small>
                  <p>{m.body}</p>
                </span>
                {read.includes(m.id) ? (
                  <Badge>Letta</Badge>
                ) : (
                  <button
                    className="cp-button"
                    onClick={() => setRead((previous) => [...previous, m.id])}
                  >
                    Segna come letta
                  </button>
                )}
              </div>
            ))}
          </div>
          {!messages.length && <p>Nessuna comunicazione personale.</p>}
        </Panel>
      ) : (
        <Panel title="Sezione non disponibile">
          <p>Questa sezione non appartiene al portale Studente.</p>
        </Panel>
      )}
    </StudentLayout>
  );
}
