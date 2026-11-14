import { ArrowLeft, Construction } from "lucide-react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import type { AuthSession } from "../modules/auth/types";
import type { CampusModuleId } from "../modules/registry";
import { dashboardHash, moduleLabel } from "../routing/routes";

export function ModulePreviewPage({
  moduleId,
  session,
}: {
  moduleId: CampusModuleId;
  session: AuthSession;
}) {
  return (
    <DashboardLayout key={moduleId} session={session} activeModule={moduleId}>
      <section className="panel module-preview">
        <Construction size={32} />
        <div className="eyebrow">
          MODULO PREVISTO · {session.role.toUpperCase()}
        </div>
        <h1>{moduleLabel(session.role, moduleId)}</h1>
        <p>
          Questa area è prevista nel piano di sviluppo JANUS. Le funzioni
          operative e i dati verranno aggiunti nelle prossime Pull Request.
        </p>
        <p>
          In questa fase puoi provare il login, la dashboard e la navigazione
          consentita al tuo account demo.
        </p>
        <a className="text-action" href={dashboardHash}>
          <ArrowLeft size={16} /> Torna alla dashboard
        </a>
      </section>
    </DashboardLayout>
  );
}
