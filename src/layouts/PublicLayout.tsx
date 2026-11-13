import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Menu } from "lucide-react";
import { Brand } from "../components/Brand";

type PublicLayoutProps = { children: ReactNode; onDashboard: () => void };

export function PublicLayout({ children, onDashboard }: PublicLayoutProps) {
  return (
    <div className="page-shell">
      <div className="demo-banner">
        <span className="demo-light" /> AMBIENTE DIMOSTRATIVO{" "}
        <span className="demo-separator">·</span> Usa solo dati fittizi durante
        la prova{" "}
        <button onClick={() => onDashboard()}>
          Accedi al campus <ArrowRight size={13} />
        </button>
      </div>
      <header className="site-header">
        <a href="#inizio" className="brand-link" aria-label="JANUS, inizio">
          <Brand />
        </a>
        <nav className="site-nav">
          <a href="#metodo">Il metodo</a>
          <a href="#percorso">I percorsi</a>
          <a
            href="https://istitutojanus.it/privacy-policy/"
            target="_blank"
            rel="noreferrer"
          >
            Privacy
          </a>
        </nav>
        <a className="header-cta" href="#richiesta">
          Parla con un consulente <ArrowRight size={15} />
        </a>
        <button className="mobile-menu-btn" aria-label="Apri navigazione">
          <Menu size={20} />
        </button>
      </header>
      <main id="inizio">{children}</main>
      <footer className="site-footer">
        <Brand />
        <span>Un percorso costruito intorno a te.</span>
        <a href="https://istitutojanus.it/" target="_blank" rel="noreferrer">
          istitutojanus.it <ArrowUpRight size={13} />
        </a>
      </footer>
    </div>
  );
}
