import { Sparkles } from "lucide-react";
import type { AuthSession } from "../../auth/types";
import { roleStats } from "../data";

export function DashboardWelcome({ session }: { session: AuthSession }) {
  return (
    <>
      <div className="dash-demo-alert">
        <Sparkles size={15} />
        <span>Campus demo locale</span>
        <span className="alert-dot">
          Tutti i valori e le attività sono inventati
        </span>
      </div>
      <div className="dash-welcome">
        <div>
          <div className="eyebrow">
            IL TUO CAMPUS ·{" "}
            {new Date().toLocaleDateString("it-IT", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
          <h1>
            {session.role === "Studente"
              ? "Il tuo prossimo traguardo"
              : session.role === "Tutor"
                ? "Il tuo spazio di tutoraggio"
                : `Benvenuto, ${session.user.displayName}`}{" "}
            <span>✦</span>
          </h1>
          <p>{roleStats[session.role].intro}</p>
        </div>
        <div className="account-role">
          <span>RUOLO DELL’ACCOUNT</span>
          <b>{session.role}</b>
        </div>
      </div>
    </>
  );
}
