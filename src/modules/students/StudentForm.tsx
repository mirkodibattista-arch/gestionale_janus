import { useState, type FormEvent } from "react";
import type { Student, StudentDetails } from "../campus/types";


export function StudentForm({ student, onSave, onCancel }: {
  student?: Student;
  onSave: (details: StudentDetails) => boolean;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const value = (key: string) => String(f.get(key) ?? "").trim();
    const details: StudentDetails = {
      name: value("name"), email: value("email").toLowerCase(),
      phone: value("phone"), city: value("city"), region: value("region"),
      age: Number(value("age")), status: value("status") as Student["status"],
      path: value("path"), course: value("course"), year: value("year"),
    };
    if (!onSave(details)) setError("Salvataggio non riuscito: controlla i campi e usa un’email demo univoca.");
  }
  return <form className="cp-form" onSubmit={submit}>
    <label>Nome e cognome<input name="name" required minLength={3} maxLength={80} defaultValue={student?.name} /></label>
    <label>Email<input name="email" type="email" required maxLength={160} defaultValue={student?.email} /></label>
    <label>Telefono demo<input name="phone" maxLength={30} defaultValue={student?.phone ?? "+39 000 000 0000"} required /></label>
    <label>Città<input name="city" maxLength={80} defaultValue={student?.city ?? "Roma"} required /></label>
    <label>Regione<input name="region" maxLength={80} defaultValue={student?.region ?? "Lazio"} required /></label>
    <label>Età<input name="age" type="number" min={14} max={100} defaultValue={student?.age ?? 18} required /></label>
    <label>Stato<select name="status" defaultValue={student?.status ?? "In iscrizione"}>{["In iscrizione", "Attivo", "Sospeso"].map(v => <option key={v}>{v}</option>)}</select></label>
    <label>Percorso<select name="path" defaultValue={student?.path ?? "Diploma"}>{["Diploma", "Recupero anni"].map(v => <option key={v}>{v}</option>)}</select></label>
    <label>Indirizzo<select name="course" defaultValue={student?.course ?? "Liceo scientifico"}>{["Liceo scientifico", "Informatica", "Amministrazione e marketing"].map(v => <option key={v}>{v}</option>)}</select></label>
    <label>Anno scolastico<select name="year" defaultValue={student?.year ?? "2026/27"}>{["2025/26", "2026/27"].map(v => <option key={v}>{v}</option>)}</select></label>
    {error && <p role="alert">{error}</p>}
    <button className="cp-button primary">{student ? "Salva modifiche demo" : "Aggiungi alla demo"}</button>
    <button type="button" className="cp-button" onClick={onCancel}>Annulla</button>
  </form>;
}
