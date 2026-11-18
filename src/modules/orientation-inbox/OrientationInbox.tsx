import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, ClipboardList, LogOut, Search, X } from "lucide-react";
import { Brand } from "../../components/Brand";
import { useAuth } from "../auth/AuthProvider";
import { authPublishableKey } from "../auth/realAuth";
import {
  maxPage, maxSearchLength, modalities, pageSize, statuses,
  type ListFilters, type Modality, type RequestDetail, type RequestListing, type RequestStatus,
} from "../../../supabase/functions/_shared/janusOrientation";
import { orientationApi, OrientationError } from "./api";

const statusLabel: Record<RequestStatus, string> = {
  nuova: "Nuova",
  contattata: "Contattata",
  in_valutazione: "In valutazione",
  chiusa: "Chiusa",
};

const modalityLabel: Record<Modality, string> = {
  gold_experience: "Gold Experience",
  gold_academy_live: "Gold Academy Live",
  gold_digital: "Gold Digital",
};

const dateFormat = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Rome",
});

function useInboxData<T>(load: (signal: AbortSignal) => Promise<T>, onDenied: () => void) {
  const [state, setState] = useState<{ load: typeof load; data?: T; error?: string }>();
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ load, data });
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      if (error instanceof OrientationError && [401, 403].includes(error.status)) {
        onDenied();
        return;
      }
      setState({
        load,
        error: error instanceof OrientationError ? error.message : "Connessione non disponibile. Riprova.",
      });
    });
    return () => controller.abort();
  }, [load, onDenied]);
  return state?.load === load ? state : undefined;
}

function Details({ id, token, onClose, onDenied }: {
  id: string;
  token: string;
  onClose: () => void;
  onDenied: () => void;
}) {
  const [retry, setRetry] = useState(0);
  const load = useCallback((signal: AbortSignal) =>
    orientationApi(authPublishableKey, token, { action: "detail", id }, signal),
  [id, token, retry]);
  const state = useInboxData<RequestDetail>(load, onDenied);
  const detail = state?.data;
  const section = useRef<HTMLElement>(null);
  useEffect(() => section.current?.focus(), [id]);
  return (
    <section ref={section} tabIndex={-1} className="inbox-panel inbox-detail" aria-label="Dettaglio richiesta">
      <div className="inbox-bar">
        <h2>{detail ? `${detail.nome} ${detail.cognome}` : "Dettaglio richiesta"}</h2>
        <button type="button" onClick={onClose}><X size={17} /> Chiudi dettaglio</button>
      </div>
      {!state && <p role="status">Caricamento dettaglio…</p>}
      {state?.error && <p role="alert">{state.error} <button onClick={() => setRetry(retry + 1)}>Riprova</button></p>}
      {detail && (
        <>
          <dl>
            <div><dt>Email</dt><dd>{detail.email}</dd></div>
            <div><dt>Telefono</dt><dd>{detail.telefono}</dd></div>
            <div><dt>Percorso</dt><dd>{detail.indirizzo_interesse || "Non indicato"}</dd></div>
            <div><dt>Modalità</dt><dd>{detail.modalita_interesse ? modalityLabel[detail.modalita_interesse] : "Non indicata"}</dd></div>
            <div><dt>Ricevuta</dt><dd>{dateFormat.format(new Date(detail.ricevuta_il))}</dd></div>
            <div><dt>Stato</dt><dd>{statusLabel[detail.stato]}</dd></div>
          </dl>
          <h3>Messaggio</h3>
          <p className="inbox-message">{detail.messaggio || "Nessun messaggio."}</p>
        </>
      )}
    </section>
  );
}

export function OrientationInbox({ token }: { token: string }) {
  const { session, signOut } = useAuth();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ListFilters>({ search: "", status: "", modality: "", page: 1 });
  const [selected, setSelected] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const load = useCallback((signal: AbortSignal) =>
    orientationApi(authPublishableKey, token, { action: "list", ...filters }, signal),
  [token, filters, retry]);
  const state = useInboxData<RequestListing>(load, signOut);
  const listing = state?.data;
  const pageCount = Math.min(maxPage, Math.max(1, Math.ceil((listing?.total ?? 0) / pageSize)));
  const update = (changes: Partial<ListFilters>) => {
    setSelected(null);
    setFilters((previous) => ({ ...previous, page: 1, ...changes }));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    update({ search: search.trim() });
  };

  return (
    <main className="orientation-inbox">
      <header className="inbox-header">
        <a href="/" aria-label="Home JANUS"><Brand /></a>
        <div><span>{session?.role}</span><button type="button" onClick={signOut}><LogOut size={17} /> Esci</button></div>
      </header>
      <section className="inbox-content">
        <div className="inbox-title"><ClipboardList aria-hidden="true" /><h1>Richieste di orientamento</h1></div>
        <p className="inbox-caption">Consultazione in sola lettura</p>
        {listing && (
          <dl className="inbox-counts" aria-label="Riepilogo per stato">
            {statuses.map((status) => (
              <div className="inbox-panel" key={status}><dt>{statusLabel[status]}</dt><dd>{listing.counts[status]}</dd></div>
            ))}
          </dl>
        )}
        <section className="inbox-panel">
          <form className="inbox-filters" onSubmit={submit}>
            <label className="inbox-search">
              Cerca richieste
              <span><input type="search" value={search} maxLength={maxSearchLength}
                onChange={(event) => setSearch(event.target.value)} placeholder="Nome, email, telefono o percorso" />
              <button type="submit"><Search size={16} /> Cerca</button></span>
            </label>
            <label>Stato
              <select value={filters.status} onChange={(event) => update({ status: event.target.value as RequestStatus | "" })}>
                <option value="">Tutti gli stati</option>
                {statuses.map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}
              </select>
            </label>
            <label>Modalità
              <select value={filters.modality} onChange={(event) => update({ modality: event.target.value as Modality | "" })}>
                <option value="">Tutte le modalità</option>
                {modalities.map((modality) => <option key={modality} value={modality}>{modalityLabel[modality]}</option>)}
              </select>
            </label>
          </form>
          {!state && <p role="status">Caricamento richieste…</p>}
          {state?.error && <p role="alert">{state.error} <button onClick={() => setRetry(retry + 1)}>Riprova</button></p>}
          {listing && (
            <>
              <p role="status">{listing.total} {listing.total === 1 ? "richiesta trovata" : "richieste trovate"}</p>
              {listing.items.length > 0 && (
                <div className="inbox-table-wrap" role="region" aria-label="Elenco richieste" tabIndex={0}>
                  <table>
                    <thead><tr><th scope="col">Richiedente</th><th scope="col">Contatti</th><th scope="col">Percorso</th>
                      <th scope="col">Modalità</th><th scope="col">Ricevuta</th><th scope="col">Stato</th><th scope="col">Azione</th></tr></thead>
                    <tbody>{listing.items.map((row) => (
                      <tr key={row.id}>
                        <th scope="row">{row.nome} {row.cognome}</th>
                        <td>{row.email}<br />{row.telefono}</td>
                        <td>{row.indirizzo_interesse || "—"}</td>
                        <td>{row.modalita_interesse ? modalityLabel[row.modalita_interesse] : "—"}</td>
                        <td>{dateFormat.format(new Date(row.ricevuta_il))}</td>
                        <td><span className="inbox-status">{statusLabel[row.stato]}</span></td>
                        <td><button type="button" aria-label={`Dettagli di ${row.nome} ${row.cognome}`}
                          aria-expanded={selected === row.id}
                          onClick={() => setSelected(selected === row.id ? null : row.id)}>Dettagli</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              <nav className="inbox-pages" aria-label="Paginazione richieste">
                <button type="button" onClick={() => update({ page: filters.page - 1 })} disabled={filters.page === 1}>
                  <ChevronLeft size={16} /> Precedente
                </button>
                <span>Pagina {filters.page} di {Math.max(filters.page, pageCount)}</span>
                <button type="button" onClick={() => update({ page: filters.page + 1 })} disabled={filters.page >= pageCount}>
                  Successiva <ChevronRight size={16} />
                </button>
              </nav>
            </>
          )}
        </section>
        {selected && <Details id={selected} token={token} onDenied={signOut} onClose={() => setSelected(null)} />}
      </section>
    </main>
  );
}
