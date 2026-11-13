import { useEffect } from "react";
import { StudentPortalPage } from "./modules/student-portal/StudentPortalPage";
import { portalForRole, portalHash } from "./routing/portals";
import { AuthProvider, useAuth } from "./modules/auth/AuthProvider";
import { CampusProvider } from "./modules/campus/CampusProvider";
import { CampusPage } from "./pages/CampusPage";
import { AccessDeniedPage } from "./pages/AccessDeniedPage";

import { LoginPage } from "./pages/LoginPage";

import { canAccessModule, isModuleId, navigate } from "./routing/routes";
import { useHashRoute } from "./routing/useHashRoute";

function PortalRedirect({ hash }: { hash: string }) {
  useEffect(() => {
    navigate(hash);
  }, [hash]);
  return null;
}
function AppRoutes() {
  const route = useHashRoute();
  const { session } = useAuth();
  if (route.page === "home" || route.page === "login")
    return session ? (
      <PortalRedirect hash={portalHash(session.role)} />
    ) : (
      <LoginPage />
    );
  if (route.page === "not-found") return <AccessDeniedPage notFound />;
  // La verifica precede il rendering di qualsiasi vista gestionale.
  if (!session)
    return (
      <LoginPage notice="Accedi per aprire il campus. Se la sessione è scaduta, inserisci di nuovo le credenziali demo." />
    );
  if (!isModuleId(route.moduleId)) return <AccessDeniedPage notFound />;
  if (!canAccessModule(session.role, route.moduleId))
    return <AccessDeniedPage />;
  if (route.portal && route.portal !== portalForRole(session.role))
    return <AccessDeniedPage />;
  if (!route.portal)
    return <PortalRedirect hash={portalHash(session.role, route.moduleId)} />;
  if (session.role === "Studente")
    return (
      <StudentPortalPage
        key={session.user.id}
        session={session}
        moduleId={route.moduleId}
      />
    );
  return (
    <CampusPage
      key={session.user.id}
      moduleId={route.moduleId}
      session={session}
    />
  );
}
export default function App() {
  return (
    <AuthProvider>
      <CampusProvider>
        <AppRoutes />
      </CampusProvider>
    </AuthProvider>
  );
}
