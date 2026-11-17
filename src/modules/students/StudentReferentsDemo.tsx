import { useState, type FormEvent } from "react";

type Referent = { name: string; relation: string; phone: string; email: string };
export function StudentReferentsDemo({ studentId, editable }: { studentId: string; editable: boolean }) {
  const [records, setRecords] = useState<Record<string, Referent[]>>({});
  const [notice, setNotice] = useState("");
  const items = records[studentId] ?? [];
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    if (!name || (!phone && !email)) {
      setNotice("Indica nome e almeno un recapito.");
      return;
    }
    const entry = { name, phone, email, relation: String(data.get("relation") ?? "") };
    setRecords(prev => ({ ...prev, [studentId]: [...(prev[studentId] ?? []), entry] }));
    setNotice("Referente aggiunto soltanto alla sessione demo.");
    form.reset();
  }
  return <section className="cp-stack" aria-label="Referenti dello studente">
    <h3>Referenti e contatti di emergenza</h3>
    <p>Solo dati inventati. Le informazioni non vengono salvate nel database e scompaiono al ricaricamento.</p>
    {items.length === 0 ? <p>Nessun referente demo inserito.</p> : (
      <div className="cp-list">{items.map((item, i) => <div key={i}>
        <span><b>{item.name} · {item.relation}</b><small>{item.phone} {item.email}</small></span>
        {editable && <button type="button" className="cp-button" onClick={() => {
          setRecords(prev => ({ ...prev, [studentId]: (prev[studentId] ?? []).filter((_, j) => j !== i) }));
          setNotice("Referente demo rimosso.");
        }}>Rimuovi</button>}
      </div>)}</div>
    )}
    {editable && <form className="cp-form" onSubmit={add}>
      <label>Nome e cognome<input name="name" maxLength={100} required /></label>
      <label>Relazione<select name="relation" defaultValue="Genitore"><option>Genitore</option><option>Tutore legale</option><option>Contatto di emergenza</option><option>Altro referente</option></select></label>
      <label>Telefono demo<input name="phone" type="tel" maxLength={30} /></label>
      <label>Email demo<input name="email" type="email" maxLength={160} /></label>
      <button className="cp-button primary" type="submit">Aggiungi referente demo</button>
    </form>}
    {notice && <p role="status">{notice}</p>}
  </section>;
}
