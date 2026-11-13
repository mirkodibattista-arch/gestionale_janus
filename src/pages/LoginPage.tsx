import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Brand } from "../components/Brand";
import { useAuth } from "../modules/auth/AuthProvider";
import { demoAccounts } from "../modules/auth/demoAccounts";
import { navigate } from "../routing/routes";
import { portalHash } from "../routing/portals";

export function LoginPage({ notice }: { notice?: string }) {
  const { signIn, demoEnabled } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const authenticated = await signIn(email, password);
      navigate(portalHash(authenticated.role));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Accesso non riuscito. Riprova.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" aria-hidden="true" />
      <div className="auth-orb auth-orb-two" aria-hidden="true" />
      <div className="auth-shell">
        <div className="auth-brand">
          <Brand />
          <span className="auth-back">
            PORTALE AZIENDALE + PORTALE STUDENTE
          </span>
        </div>
        <div className="auth-grid">
          <section className="auth-intro">
            <div className="auth-eyebrow">
              <Sparkles size={15} /> JANUS DIGITAL CAMPUS
            </div>
            <h1>
              Il tuo mondo.
              <br />
              <span>Un solo accesso.</span>
            </h1>
            <p>
              Il gestionale JANUS per il personale e gli studenti. Un’unica
              applicazione, due portali dedicati: il tuo account apre
              automaticamente lo spazio giusto.
            </p>
            <div className="auth-feature">
              <GraduationCap size={23} />
              <div>
                <b>Uno spazio per ogni percorso</b>
                <span>Studenti, tutor e team JANUS, sempre connessi.</span>
              </div>
            </div>
            <div className="auth-feature">
              <ShieldCheck size={23} />
              <div>
                <b>La tua dashboard, automaticamente</b>
                <span>Il ruolo è associato al tuo account.</span>
              </div>
            </div>
            <div className="auth-demo-note">
              <span className="demo-light" /> Ambiente demo locale · Solo
              identità fittizie
            </div>
          </section>
          <section className="auth-card" aria-labelledby="login-title">
            <div className="auth-lock">
              <LockKeyhole size={25} />
            </div>
            <div className="auth-eyebrow">BENVENUTO NEL CAMPUS</div>
            <h2 id="login-title">Accedi a JANUS</h2>
            <p>
              Usa il tuo account demo. Riconosciamo automaticamente il ruolo e
              il tuo portale.
            </p>
            {notice && (
              <p className="auth-notice" role="status">
                {notice}
              </p>
            )}
            {!demoEnabled && (
              <div className="auth-error" role="alert">
                La modalità demo è disattivata. L’autenticazione reale deve
                ancora essere configurata.
              </div>
            )}
            <form onSubmit={submit} aria-busy={busy}>
              <label className="auth-label" htmlFor="login-email">
                Email
              </label>
              <div className="auth-input">
                <Mail size={18} />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  placeholder="nome@janus-demo.test"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={busy || !demoEnabled}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>
              <label className="auth-label" htmlFor="login-password">
                Password
              </label>
              <div className="auth-input">
                <LockKeyhole size={18} />
                <input
                  id="login-password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="La tua password demo"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={busy || !demoEnabled}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  aria-label={visible ? "Nascondi password" : "Mostra password"}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <div id="login-error" className="auth-error" role="alert">
                  {error}
                </div>
              )}
              <button
                className="auth-submit"
                type="submit"
                disabled={busy || !demoEnabled}
              >
                {busy ? "Accesso in corso…" : "Accedi al campus"}
                <ArrowRight size={18} />
              </button>
            </form>
            <button
              className="recovery-link"
              onClick={() => setRecovery(!recovery)}
            >
              Password dimenticata?
            </button>
            {recovery && (
              <p role="status">
                Recupero email non attivo nella demo. Usa le credenziali
                dimostrative qui sotto. Supabase Auth sarà integrato in una fase
                successiva.
              </p>
            )}
            <p className="auth-disclaimer">
              Demo pubblica: credenziali e controlli sono nel browser e non
              costituiscono un’autenticazione sicura. Non inserire password
              reali.
            </p>
            {demoEnabled && (
              <details className="auth-accounts">
                <summary>Consulta gli account dimostrativi</summary>
                <p>
                  Password comune: <code>CampusDemo!2026</code>
                </p>
                <ul>
                  {demoAccounts.map((account) => (
                    <li key={account.id}>
                      <b>{account.role}</b>
                      <code>{account.email}</code>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        </div>
        <footer className="auth-footer">
          JANUS Digital Campus · Il tuo prossimo capitolo inizia qui.
        </footer>
      </div>
    </main>
  );
}
