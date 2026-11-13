import type { AuthSession } from "../modules/auth/types";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { campusModules, type CampusModuleId } from "../modules/registry";
import { CampusOverview } from "../modules/dashboard/CampusOverview";
import { StudentsModule } from "../modules/students/StudentsModule";
import { ActivitiesModule } from "../modules/activities/ActivitiesModule";
import { AnalyticsModule } from "../modules/analytics/AnalyticsModule";
import { OperationsModule } from "../modules/campus/OperationsModule";
export function CampusPage({
  session,
  moduleId,
}: {
  session: AuthSession;
  moduleId: CampusModuleId;
}) {
  const titles = {
    Admin: "Il tuo campus, in un colpo d’occhio.",
    Supervisore: "Persone, attività e percorsi sotto controllo.",
    Segreteria: "Ogni pratica, al posto giusto.",
    Didattica: "Connetti competenze e percorsi.",
    Amministrazione: "La situazione economica del campus.",
    Tutor: "Il tuo spazio di tutoraggio.",
    Studente: "Il tuo prossimo traguardo inizia qui.",
    Audit: "Una visione chiara, in sola lettura.",
  };
  return (
    <DashboardLayout session={session} activeModule={moduleId}>
      <div className="cp-page-head">
        <div>
          <span className="cp-eyebrow">
            WORKSPACE / {session.role.toUpperCase()}
          </span>
          <h1>
            {moduleId === "dashboard"
              ? titles[session.role]
              : campusModules[moduleId].label}
          </h1>
          <p>
            {session.role === "Audit"
              ? "Modalità Audit · sola consultazione · 6 studenti autorizzati"
              : "Benvenuto nel tuo spazio JANUS. Tutti i dati sono dimostrativi."}
          </p>
        </div>
        <span className="cp-live">
          <i /> DEMO LOCALE
        </span>
      </div>
      {moduleId === "dashboard" ? (
        <CampusOverview session={session} />
      ) : ["studenti", "profilo"].includes(moduleId) ? (
        <StudentsModule session={session} profile={moduleId === "profilo"} />
      ) : moduleId === "attivita" ? (
        <ActivitiesModule session={session} />
      ) : ["statistiche", "report"].includes(moduleId) ? (
        <AnalyticsModule session={session} report={moduleId === "report"} />
      ) : (
        <OperationsModule session={session} moduleId={moduleId} />
      )}
    </DashboardLayout>
  );
}
