import { useState } from "react";
import { useOrientationForm } from "./modules/orientation/hooks/useOrientationForm";
import { DashboardPage } from "./pages/DashboardPage";
import { OrientationPage } from "./pages/OrientationPage";

export default function App() {
  const [screen, setScreen] = useState<"form" | "dashboard">("form");
  const orientationForm = useOrientationForm();

  if (screen === "dashboard")
    return <DashboardPage onExit={() => setScreen("form")} />;
  return (
    <OrientationPage
      onDashboard={() => setScreen("dashboard")}
      controller={orientationForm}
    />
  );
}
