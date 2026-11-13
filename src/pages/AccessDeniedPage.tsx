import { ArrowLeft, ShieldAlert } from "lucide-react";
import { portalPath } from "../routing/portals";
import { useAuth } from "../modules/auth/AuthProvider";

export function AccessDeniedPage({ notFound = false }: { notFound?: boolean }) {
  const { session } = useAuth();
  return (
    <main className="auth-page auth-status">
      <section className="auth-card">
        <div className="auth-lock">
          <ShieldAlert size={28} />
        </div>
        <h1>{notFound ? "Pagina non trovata" : "Accesso negato"}</h1>
        <p>
          {notFound
            ? "Questo indirizzo non corrisponde a una pagina del campus."
            : "Il tuo account non è autorizzato ad aprire questa sezione."}
        </p>
        <a className="auth-submit" href={session ? portalPath(session.role) : "/login"}>
          <ArrowLeft size={16} /> Torna alla tua dashboard
        </a>
        <a className="auth-back" href="/">
          Vai alla Home JANUS
        </a>
      </section>
    </main>
  );
}
