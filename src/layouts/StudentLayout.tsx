import { useState, type ReactNode } from "react";
import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { Brand } from "../components/Brand";
import { useAuth } from "../modules/auth/AuthProvider";
import { campusModules, type CampusModuleId } from "../modules/registry";
import { navigate, roleModules } from "../routing/routes";
import { portalHash } from "../routing/portals";
import { useCampusTheme } from "./useCampusTheme";

export function StudentLayout({
  activeModule,
  children,
}: {
  activeModule: CampusModuleId;
  children: ReactNode;
}) {
  const { session, signOut } = useAuth();
  const { theme, toggleTheme } = useCampusTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!session || session.role !== "Studente") return null;
  const links = () =>
    roleModules.Studente.map((id) => {
      const Icon = campusModules[id].icon;
      return (
        <a
          key={id}
          href={portalHash("Studente", id)}
          aria-current={id === activeModule ? "page" : undefined}
          onClick={() => setMenuOpen(false)}
        >
          <Icon size={17} />
          {campusModules[id].label}
        </a>
      );
    });
  return (
    <main
      className={`dashboard-shell campus-app student-portal ${theme}`}
      data-theme={theme}
      data-portal="studente"
    >
      <header className="student-topbar">
        <a href={portalHash("Studente")} aria-label="La mia area JANUS">
          <Brand />
        </a>
        <span className="student-portal-label">PORTALE STUDENTE</span>
        <div className="top-spacer" />
        <button
          className="icon-button"
          aria-label="Cambia tema"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="account-context">
          <b>{session.role}</b>
          <span>{session.user.email}</span>
        </div>
        <button
          className="campus-logout"
          onClick={() => {
            signOut();
            navigate("#/login");
          }}
        >
          <LogOut size={16} />
          <span>Esci</span>
        </button>
        <button
          className="mobile-menu"
          aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={20} />
        </button>
      </header>
      <nav
        className="student-navigation"
        data-portal-navigation
        aria-label="Il mio percorso"
      >
        {links()}
      </nav>
      {menuOpen && (
        <nav className="mobile-dash-menu" aria-label="Il mio percorso mobile">
          {links()}
        </nav>
      )}
      <div className="student-content">
        {children}
        <footer className="dash-footer">
          <span>JANUS · Il tuo percorso scolastico</span>
          <span>Demo · Solo dati fittizi</span>
        </footer>
      </div>
    </main>
  );
}
