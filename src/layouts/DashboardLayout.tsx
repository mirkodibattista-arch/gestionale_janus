import { useState, type ReactNode } from "react";
import { Bell, Menu, Search, ShieldCheck } from "lucide-react";
import { Brand } from "../components/Brand";
import { campusModules, dashboardNavigation } from "../modules/registry";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="dashboard-shell">
      <aside className="dash-sidebar">
        <Brand />
        <div className="demo-pill">
          <span /> PROTOTIPO DEMO
        </div>
        <div className="dash-nav-label">WORKSPACE</div>
        <nav className="dash-nav">
          {dashboardNavigation.map((id) => {
            const { label, icon: Icon, badge } = campusModules[id];
            return (
              <div
                key={id}
                className={`dash-nav-item${id === "dashboard" ? " active" : ""}`}
              >
                <Icon size={17} /> {label}
                {badge && (
                  <>
                    {" "}
                    <span className="nav-count">{badge}</span>
                  </>
                )}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <ShieldCheck size={17} />
          <div>
            <b>Accesso protetto</b>
            <span>Prototipo senza autenticazione</span>
          </div>
        </div>
      </aside>
      <section className="dash-main">
        <header className="dash-topbar">
          <button
            className="mobile-menu"
            aria-label="Apri menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={19} />
          </button>
          <div className="dash-search">
            <Search size={16} />
            <span>Cerca in JANUS</span>
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-spacer" />
          <div className="top-date">MERCOLEDÌ, 11 NOVEMBRE 2026</div>
          <button className="icon-button" aria-label="Notifiche">
            <Bell size={18} />
            <i />
          </button>
          <div className="avatar">MD</div>
        </header>
        {menuOpen && (
          <div className="mobile-dash-menu">
            Dashboard · Studenti · Iscrizioni · Segreteria · Amministrazione ·
            Didattica
          </div>
        )}
        <div className="dashboard-content">
          {children}
          <footer className="dash-footer">
            <span>JANUS · Ambiente dimostrativo</span>
            <span>Nessun dato reale · Nessun account autenticato</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
