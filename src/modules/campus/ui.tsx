import type { ReactNode } from "react";
export function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="cp-panel">
      <div className="cp-panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className={`cp-badge ${children === "Attivo" || children === "Completo" || children === "Saldato" ? "good" : ""}`}
    >
      {children}
    </span>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div className="cp-progress" aria-label={`Avanzamento ${value}%`}>
      <i style={{ width: `${value}%` }} />
      <span>{value}%</span>
    </div>
  );
}
export function Empty() {
  return (
    <p className="cp-empty">Nessun risultato. Prova a modificare i filtri.</p>
  );
}
export const money = (n: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
export const dateLabel = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
