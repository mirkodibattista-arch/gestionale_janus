import { OrientationPage } from "./pages/OrientationPage";
import { useOrientationForm } from "./modules/orientation/hooks/useOrientationForm";
import { useEffect } from "react";
import { StudentPortalPage } from "./modules/student-portal/StudentPortalPage";
import { portalForRole, portalPath, sessionPath } from "./routing/portals";
import { canReadOrientation, orientationPath } from "../supabase/functions/_shared/janusOrientation";
import { OrientationInbox } from "./modules/orientation-inbox/OrientationInbox";
import { AuthProvider, useAuth } from "./modules/auth/AuthProvider";
import { CampusProvider } from "./modules/campus/CampusProvider";
import { CampusPage } from "./pages/CampusPage";
import { AccessDeniedPage } from "./pages/AccessDeniedPage";

import { LoginPage } from "./pages/LoginPage";

import { canAccessModule, isModuleId, navigate } from "./routing/routes";
import { useAppRoute } from "./routing/useAppRoute";

function PortalRedirect({ to }: { to: string }) {
  useEffect(() => {
    navigate(to, { replace: true });
  }, [to]);
  return null;
}
function AppRoutes() {
  const route = useAppRoute();
  const { session, token, loading, notice } = useAuth();
  const orientationForm = useOrientationForm();
  if (route.page === "home" || route.page === "orientation")
    return (
      <OrientationPage
        onDashboard={() => navigate("/login")}
        controller={orientationForm}
        formOnly={route.page === "orientation"}
      />
    );
  if (route.page === "not-found") return <AccessDeniedPage notFound />;
  if (loading) return <main className="auth-page"><p role="status">Verifica sessione…</p></main>;
  if (route.page === "login")
    return session ? (
      <PortalRedirect to={sessionPath(session)} />
    ) : (
      <LoginPage notice={notice} />
    );
  if (!session)
    return (
      <LoginPage notice={notice || "Accedi per aprire il campus."} />
    );
  if (session.mode === "supabase") {
    if (route.portal === "studente" || !canReadOrientation(session.role) || !token) {
      return <AccessDeniedPage />;
    }
    if (route.moduleId === "dashboard") return <PortalRedirect to={orientationPath} />;
    if (route.moduleId !== "richieste-orientamento") return <AccessDeniedPage />;
    if (!route.portal || window.location.hash.startsWith("#/")) {
      return <PortalRedirect to={orientationPath} />;
    }
    return <OrientationInbox key={session.user.id} token={token} />;
  }
  if (route.moduleId === "richieste-orientamento") return <AccessDeniedPage />;
  if (!isModuleId(route.moduleId)) return <AccessDeniedPage notFound />;
  if (!canAccessModule(session.role, route.moduleId))
    return <AccessDeniedPage />;
  if (route.portal && route.portal !== portalForRole(session.role))
    return <AccessDeniedPage />;
  if (!route.portal)
    return <PortalRedirect to={portalPath(session.role, route.moduleId)} />;
  if (window.location.hash.startsWith("#/"))
    return <PortalRedirect to={portalPath(session.role, route.moduleId)} />;
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
