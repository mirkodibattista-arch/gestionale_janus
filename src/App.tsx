import { AuthProvider, useAuth } from "./modules/auth/AuthProvider";
import { CampusProvider } from "./modules/campus/CampusProvider";
import { CampusPage } from "./pages/CampusPage";
import { AccessDeniedPage } from "./pages/AccessDeniedPage";

import { LoginPage } from "./pages/LoginPage";

import { canAccessModule, isModuleId } from "./routing/routes";
import { useHashRoute } from "./routing/useHashRoute";

function AppRoutes() {
  const route = useHashRoute();
  const { session } = useAuth();
  if (route.page === "home") return <LoginPage />;
  if (route.page === "login") return <LoginPage />;
  if (route.page === "not-found") return <AccessDeniedPage notFound />;
  // La verifica precede il rendering di qualsiasi vista gestionale.
  if (!session)
    return (
      <LoginPage notice="Accedi per aprire il campus. Se la sessione è scaduta, inserisci di nuovo le credenziali demo." />
    );
  if (!isModuleId(route.moduleId)) return <AccessDeniedPage notFound />;
  if (!canAccessModule(session.role, route.moduleId))
    return <AccessDeniedPage />;
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
