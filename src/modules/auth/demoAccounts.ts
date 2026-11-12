import type { Role } from "../../types/roles";

export const DEMO_PASSWORD = "CampusDemo!2026";
type DemoAccount = {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  active: boolean;
};

// Solo fixture pubbliche. La password condivisa è nel bundle: questa NON è
// autenticazione sicura. Non usare account, password o dati personali reali.
export const demoAccounts: readonly DemoAccount[] = [
  {
    id: "demo-01",
    email: "admin@janus-demo.test",
    displayName: "Admin demo",
    role: "Admin",
    active: true,
  },
  {
    id: "demo-02",
    email: "supervisore@janus-demo.test",
    displayName: "Supervisore demo",
    role: "Supervisore",
    active: true,
  },
  {
    id: "demo-03",
    email: "segreteria@janus-demo.test",
    displayName: "Segreteria demo",
    role: "Segreteria",
    active: true,
  },
  {
    id: "demo-04",
    email: "amministrazione@janus-demo.test",
    displayName: "Amministrazione demo",
    role: "Amministrazione",
    active: true,
  },
  {
    id: "demo-05",
    email: "didattica@janus-demo.test",
    displayName: "Didattica demo",
    role: "Didattica",
    active: true,
  },
  {
    id: "demo-06",
    email: "tutor@janus-demo.test",
    displayName: "Tutor demo",
    role: "Tutor",
    active: true,
  },
  {
    id: "demo-07",
    email: "studente@janus-demo.test",
    displayName: "Studente demo",
    role: "Studente",
    active: true,
  },
];
