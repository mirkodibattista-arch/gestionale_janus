import { useState, type FormEvent } from "react";

type Draft = {
  nome: string; cognome: string; codiceFiscale: string; dataNascita: string;
  luogoNascita: string; email: string; telefono: string; indirizzo: string;
  comune: string; provincia: string; cap: string; percorso: string;
  indirizzoStudi: string; anno: string;
};
const empty: Draft = {
  nome: "", cognome: "", codiceFiscale: "", dataNascita: "",
  luogoNascita: "", email: "", telefono: "", indirizzo: "",
  comune: "", provincia: "", cap: "", percorso: "Diploma",
  indirizzoStudi: "Liceo scientifico", anno: "2026/27",
};
type Field = { key: keyof Draft; label: string; required?: boolean; type?: string; max?: number };
const sections: { title: string; fields: Field[] }[] = [
  { title: "Dati anagrafici", fields: [
    { key: "nome", label: "Nome", required: true, max: 80 },
    { key: "cognome", label: "Cognome", required: true, max: 80 },
    { key: "codiceFiscale", label: "Codice fiscale", max: 16 },
    { key: "dataNascita", label: "Data di nascita", type: "date" },
    { key: "luogoNascita", label: "Luogo di nascita", max: 100 },
  ] },
  { title: "Contatti e residenza", fields: [
    { key: "email", label: "Email", type: "email", max: 160 },
    { key: "telefono", label: "Telefono", max: 30 },
    { key: "indirizzo", label: "Indirizzo", max: 160 },
    { key: "comune", label: "Comune", max: 100 },
    { key: "provincia", label: "Provincia (sigla)", max: 2 },
    { key: "cap", label: "CAP", max: 5 },
  ] },
];
export function StudentAnagraficaDraft({ onClose }: { onClose: () => void }) {
  const [draft, setDraft] = useState<Draft>({ ...empty });
  const [saved, setSaved] = useState<Draft | null>(null);
  const [status, setStatus] = useState<"Bozza" | "In verifica">("Bozza");
  const [notice, setNotice] = useState("");
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const change = (key: keyof Draft, value: string) => {
    setDraft(d => ({ ...d, [key]: value }));
    setStatus("Bozza");
    setNotice("");
  };
  const saveDraft = () => {
    setSaved({ ...draft });
    setStatus("Bozza");
    setNotice("Bozza salvata solo in questa schermata demo. Nessun dato inviato al database.");
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.nome.trim() || !draft.cognome.trim()) {
      setNotice("Inserisci nome e cognome prima di inviare in verifica.");
      return;
    }
    const cf = draft.codiceFiscale.trim().toUpperCase();
    if (cf && !/^[A-Z0-9]{16}$/.test(cf)) {
      setNotice("Il codice fiscale deve contenere 16 caratteri alfanumerici.");
      return;
    }
    if (draft.cap && !/^\d{5}$/.test(draft.cap)) {
      setNotice("Il CAP deve contenere 5 cifre.");
      return;
    }
    if (draft.dataNascita && draft.dataNascita > today) {
      setNotice("La data di nascita non può essere futura.");
      return;
    }
    setSaved({ ...draft });
    setStatus("In verifica");
    setNotice("Invio in verifica simulato. Nessun workflow o record reale creato.");
  };
  return (
    <section className="cp-stack" aria-label="Anteprima anagrafica studente">
      <div className="cp-profile-head">
        <div><h2>Nuova scheda studente</h2><p>Anteprima indipendente · solo dati inventati · stato: {status}</p></div>
        <button type="button" className="cp-button" onClick={onClose}>Chiudi anteprima</button>
      </div>
      <form className="cp-stack" onSubmit={submit}>
        {sections.map(section => (
          <div className="cp-stack" key={section.title}>
            <h3>{section.title}</h3>
            <div className="cp-form">
              {section.fields.map(field => (
                <label key={field.key}>{field.label}
                  <input
                    type={field.type ?? "text"} value={draft[field.key]}
                    name={field.key} max={field.key === "dataNascita" ? today : undefined}
                    maxLength={field.max} required={field.required}
                    onChange={e => change(field.key, e.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
        <h3>Percorso scolastico</h3>
        <div className="cp-form">
          <label>Percorso<select value={draft.percorso} onChange={e => change("percorso", e.target.value)}>
            <option>Diploma</option><option>Recupero anni</option>
          </select></label>
          <label>Indirizzo<select value={draft.indirizzoStudi} onChange={e => change("indirizzoStudi", e.target.value)}>
            <option>Liceo scientifico</option><option>Informatica</option><option>Amministrazione e marketing</option>
          </select></label>
          <label>Anno scolastico<select value={draft.anno} onChange={e => change("anno", e.target.value)}>
            <option>2025/26</option><option>2026/27</option>
          </select></label>
        </div>
        <div className="cp-toolbar">
          <button type="button" className="cp-button" onClick={saveDraft}>Salva bozza (demo)</button>
          <button type="submit" className="cp-button primary">Invia in verifica (demo)</button>
          {saved && <button type="button" className="cp-button" onClick={() => {
            setDraft({ ...saved }); setStatus("Bozza"); setNotice("Ultima versione salvata ripristinata.");
          }}>Ripristina bozza</button>}
        </div>
        {notice && <p role="status">{notice}</p>}
        <p>Questa anteprima non modifica l'elenco studenti, non salva su Supabase e perde i dati alla chiusura o al ricaricamento.</p>
      </form>
    </section>
  );
}
