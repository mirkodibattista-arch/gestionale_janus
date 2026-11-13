import { useEffect, useState, type ReactNode } from "react";
import { Bell, Home, LogOut, Menu, ShieldCheck, Sun, Moon } from "lucide-react";
import { Brand } from "../components/Brand";
import { useAuth } from "../modules/auth/AuthProvider";
import type { AuthSession } from "../modules/auth/types";
import { campusModules, type CampusModuleId } from "../modules/registry";
import { moduleLabel, navigate, roleModules } from "../routing/routes";

type DashboardLayoutProps = {
  children: ReactNode;
  session: AuthSession;
  activeModule?: CampusModuleId;
};
export function DashboardLayout({
  children,
  session,
  activeModule = "dashboard",
}: DashboardLayoutProps) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("janus.theme") ?? "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("janus.theme", theme);
    } catch {
      /* optional preference */
    }
  }, [theme]);
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const links = roleModules[session.role];
  const logout = () => {
    signOut();
    navigate("#/login");
  };
  const navLinks = () =>
    links.map((id) => {
      const Icon = campusModules[id].icon;
      return (
        <a
          key={id}
          className={`dash-nav-item${id === activeModule ? " active" : ""}`}
          href={`#/campus/${id}`}
          onClick={() => setMenuOpen(false)}
          aria-current={id === activeModule ? "page" : undefined}
        >
          <Icon size={17} /> {moduleLabel(session.role, id)}
        </a>
      );
    });
  return (
    <main className={`dashboard-shell campus-app ${theme}`} data-theme={theme}>
      <aside className="dash-sidebar">
        <a href="#/" aria-label="Home JANUS">
          <Brand />
        </a>
        <div className="demo-pill">
          <span /> DEMO LOCALE
        </div>
        <div className="dash-nav-label">IL TUO CAMPUS</div>
        <nav className="dash-nav" aria-label="Navigazione campus">
          {navLinks()}
        </nav>
        <div className="sidebar-bottom">
          <ShieldCheck size={17} />
          <div>
            <b>{session.role}</b>
            <span>Account demo · sessione locale</span>
          </div>
        </div>
      </aside>
      <section className="dash-main">
        <header className="dash-topbar">
          <button
            className="mobile-menu"
            aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={19} />
          </button>
          <a className="campus-home-link" href="#/">
            <Home size={16} />
            <span>Home JANUS</span>
          </a>
          <div className="top-spacer" />
          <button
            className="icon-button"
            aria-label="Cambia tema"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="account-context">
            <b>{session.role}</b>
            <span>{session.user.email}</span>
          </div>
          <button
            className="icon-button"
            aria-label="Notifiche"
            aria-expanded={noticeOpen}
            onClick={() => setNoticeOpen(!noticeOpen)}
          >
            <Bell size={18} />
          </button>
          <button className="campus-logout" onClick={logout}>
            <LogOut size={16} />
            <span>Esci</span>
          </button>
        </header>
        {noticeOpen && (
          <div className="campus-notice" role="status">
            Nessuna nuova notifica nella demo locale.
          </div>
        )}
        {menuOpen && (
          <nav
            className="mobile-dash-menu"
            aria-label="Navigazione campus mobile"
          >
            {navLinks()}
          </nav>
        )}
        <div className="dashboard-content">
          {children}
          <footer className="dash-footer">
            <span>JANUS · Ambiente dimostrativo</span>
            <span>Solo dati sintetici · Accesso demo {session.role}</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
