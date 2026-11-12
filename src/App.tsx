import { AuthProvider, useAuth } from "./modules/auth/AuthProvider";
import { useOrientationForm } from "./modules/orientation/hooks/useOrientationForm";
import { AccessDeniedPage } from "./pages/AccessDeniedPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { OrientationPage } from "./pages/OrientationPage";
import { ModulePreviewPage } from "./pages/ModulePreviewPage";
import {
  canAccessModule,
  dashboardHash,
  isModuleId,
  navigate,
} from "./routing/routes";
import { useHashRoute } from "./routing/useHashRoute";

function AppRoutes() {
  const route = useHashRoute();
  const { session } = useAuth();
  const orientationForm = useOrientationForm();
  if (route.page === "home")
    return (
      <OrientationPage
        onDashboard={() => navigate(session ? dashboardHash : "#/login")}
        controller={orientationForm}
      />
    );
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
  return route.moduleId === "dashboard" ? (
    <DashboardPage session={session} />
  ) : (
    <ModulePreviewPage moduleId={route.moduleId} session={session} />
  );
}
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
