import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookOpen,
  Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardList, GraduationCap,
  LayoutDashboard, LockKeyhole, Menu, Search, ShieldCheck, Sparkles, Users,
  WalletCards, X,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { supabase } from "./lib/supabase";

type Role = "Admin" | "Supervisore" | "Segreteria" | "Amministrazione" | "Didattica";
type FormState = {
  nome: string; cognome: string; email: string; telefono: string;
  indirizzo_interesse: string; modalita_interesse: string; messaggio: string;
  informativa_letta: boolean; consenso_marketing: boolean; website: string;
};

const initialForm: FormState = {
  nome: "", cognome: "", email: "", telefono: "", indirizzo_interesse: "",
  modalita_interesse: "", messaggio: "", informativa_letta: false,
  consenso_marketing: false, website: "",
};

const courses = [
  "Liceo Scientifico", "Liceo Scientifico Sportivo", "Liceo Scienze Applicate",
  "Liceo Classico", "Liceo Linguistico", "Liceo Scienze Umane",
  "Liceo Economico Sociale", "Istituto Tecnico Tecnologico Informatico",
  "Amministrazione Finanza e Marketing", "Istituto Professionale Socio Sanitario",
  "Istituto Tecnico del Turismo", "Istituto Tecnico MME",
  "Enogastronomia e Ospitalità Alberghiera",
];

const roleStats: Record<Role, { intro: string; items: [string, string, string, string] }> = {
  Admin: { intro: "Panoramica operativa dell’intero gestionale.", items: ["Studenti attivi", "Nuove iscrizioni", "Pagamenti ricevuti", "Tutor attivi"] },
  Supervisore: { intro: "Monitoraggio delle attività e delle pratiche in corso.", items: ["Pratiche da verificare", "Iscrizioni in attesa", "Attività reparti", "Scadenze importanti"] },
  Segreteria: { intro: "Pratiche scolastiche, documenti e percorsi degli studenti.", items: ["Studenti in gestione", "Documenti mancanti", "Piani di studio", "Esami programmati"] },
  Amministrazione: { intro: "Rette, pagamenti e prossime scadenze.", items: ["Rette del periodo", "Pagamenti ricevuti", "Rate in sospeso", "Scadenze imminenti"] },
  Didattica: { intro: "Assegnazioni, competenze tutor e supporto didattico.", items: ["Studenti assegnati", "Tutor disponibili", "Richieste materie", "Esami programmati"] },
};

function Brand() {
  return <div className="flex items-center gap-3">
    <div className="brand-mark"><span>J</span><i /></div>
    <div><div className="text-[17px] font-extrabold tracking-[.2em] text-slate-900">JANUS</div><div className="-mt-0.5 text-[9px] font-semibold tracking-[.17em] text-slate-400">STUDENT MANAGER</div></div>
  </div>;
}

function Field({ label, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return <label htmlFor={id} className="field-wrap"><span>{label}</span><input id={id} className="field" {...props} /></label>;
}

function DashboardDemo({ onExit }: { onExit: () => void }) {
  const [role, setRole] = useState<Role>("Admin");
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboard = roleStats[role];
  const numbers = role === "Admin" ? ["248", "18", "€ 42.850", "16"] : ["24", "8", "12", "6"];
  return <main className="dashboard-shell">
    <aside className="dash-sidebar">
      <Brand />
      <div className="demo-pill"><span /> PROTOTIPO DEMO</div>
      <div className="dash-nav-label">WORKSPACE</div>
      <nav className="dash-nav">
        <div className="dash-nav-item active"><LayoutDashboard size={17} /> Dashboard</div>
        <div className="dash-nav-item"><Users size={17} /> Studenti <span className="nav-count">248</span></div>
        <div className="dash-nav-item"><ClipboardList size={17} /> Iscrizioni</div>
        <div className="dash-nav-item"><BookOpen size={17} /> Segreteria</div>
        <div className="dash-nav-item"><WalletCards size={17} /> Amministrazione</div>
        <div className="dash-nav-item"><GraduationCap size={17} /> Didattica</div>
      </nav>
      <div className="sidebar-bottom"><ShieldCheck size={17} /><div><b>Accesso protetto</b><span>Prototipo senza autenticazione</span></div></div>
    </aside>
    <section className="dash-main">
      <header className="dash-topbar"><button className="mobile-menu" aria-label="Apri menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={19} /></button><div className="dash-search"><Search size={16} /><span>Cerca in JANUS</span><kbd>⌘ K</kbd></div><div className="top-spacer" /><div className="top-date">MERCOLEDÌ, 11 NOVEMBRE 2026</div><button className="icon-button" aria-label="Notifiche"><Bell size={18} /><i /></button><div className="avatar">MD</div></header>
      {menuOpen && <div className="mobile-dash-menu">Dashboard · Studenti · Iscrizioni · Segreteria · Amministrazione · Didattica</div>}
      <div className="dashboard-content">
        <div className="dash-demo-alert"><Sparkles size={15} /><span>Anteprima dimostrativa</span><span className="alert-dot">Tutti i valori e le attività sono inventati</span><button onClick={onExit} aria-label="Esci dall'anteprima"><X size={15} /></button></div>
        <div className="dash-welcome"><div><div className="eyebrow">PANORAMICA · MERCOLEDÌ 11 NOVEMBRE</div><h1>Buongiorno, Mirko <span>✦</span></h1><p>{dashboard.intro}</p></div>
          <div className="role-picker"><span>Vista di ruolo</span><select value={role} onChange={e => setRole(e.target.value as Role)} aria-label="Seleziona dashboard demo">{Object.keys(roleStats).map(r => <option key={r}>{r}</option>)}</select><ChevronDown size={15} /></div>
        </div>
        <div className="kpi-grid">{dashboard.items.map((title, i) => <article className="kpi-card" key={title}><div className="kpi-top"><span>{title}</span><span className={i === 2 ? "kpi-icon green" : "kpi-icon"}>{[<Users size={16} />, <ClipboardList size={16} />, <WalletCards size={16} />, <GraduationCap size={16} />][i]}</span></div><strong>{numbers[i]}</strong><div className="kpi-foot"><span className={i === 1 ? "kpi-change amber" : "kpi-change"}>{i === 1 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{i === 1 ? "3 in verifica" : "+8,4%"}</span><span>rispetto al mese scorso</span></div></article>)}</div>
        <div className="dash-panels"><section className="panel chart-panel"><div className="panel-heading"><div><h2>Andamento iscrizioni</h2><p>Nuove pratiche · ultimi 6 mesi</p></div><button className="period-select">Questo semestre <ChevronDown size={14} /></button></div><div className="chart-area"><div className="chart-y"><span>30</span><span>20</span><span>10</span><span>0</span></div><div className="chart-bars">{[{m:"Giu",v:38},{m:"Lug",v:57},{m:"Ago",v:47},{m:"Set",v:74},{m:"Ott",v:62},{m:"Nov",v:88}].map(p=><div className="bar-group" key={p.m}><div className="bar-wrap"><i className="bar pale" style={{height:`${p.v*.55}%`}} /><i className="bar" style={{height:`${p.v}%`}} /></div><small>{p.m}</small></div>)}</div></div><div className="chart-legend"><span><i /> Nuove iscrizioni</span><span><i /> Pratiche completate</span></div></section>
          <section className="panel activity-panel"><div className="panel-heading"><div><h2>Attività recenti</h2><p>Ultimi aggiornamenti</p></div><button className="dots">···</button></div>{[{n:"LC",name:"Luca Conti",action:"ha completato l'invio documenti",time:"10 min fa",c:"blue"},{n:"MR",name:"Marta Riva",action:"ha richiesto un orientamento",time:"42 min fa",c:"cyan"},{n:"SG",name:"Sara Greco",action:"ha aggiornato un piano di studi",time:"1 ora fa",c:"purple"}].map(a=><div className="activity-row" key={a.name}><div className={`mini-avatar ${a.c}`}>{a.n}</div><div className="activity-text"><b>{a.name}</b><span>{a.action}</span><small>{a.time}</small></div><span className="activity-check"><Check size={14} /></span></div>)}<button className="activity-link">Vedi tutte le attività <ArrowRight size={14} /></button></section></div>
        <section className="panel tasks-panel"><div className="panel-heading"><div><h2>Pratiche da seguire</h2><p>Una vista rapida delle priorità</p></div><button className="text-action">Apri elenco <ArrowRight size={14} /></button></div><div className="table-scroll"><table><thead><tr><th>STUDENTE</th><th>ATTIVITÀ</th><th>REFERENTE</th><th>SCADENZA</th><th>STATO</th></tr></thead><tbody>{[["Alessio R.","Documenti da verificare","Segreteria","Oggi","Da verificare"],["Giulia M.","Assegnazione tutor","Didattica","Domani","In corso"],["Davide P.","Rata mensile","Amministrazione","18 Nov","In scadenza"]].map((r,i)=><tr key={r[0]}><td><span className={`student-avatar s${i}`}>{r[0].slice(0,1)}</span>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><span className={`status status-${i}`}>{r[4]}</span></td></tr>)}</tbody></table></div></section>
        <footer className="dash-footer"><span>JANUS · Ambiente dimostrativo</span><span>Nessun dato reale · Nessun account autenticato</span></footer>
      </div>
    </section>
  </main>;
}

export default function App() {
  const [screen, setScreen] = useState<"form" | "dashboard">("form");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const update = (key: keyof FormState, value: string | boolean) => {
    setForm(current => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  const advance = () => {
    setError("");
    if (step === 1) {
      if (![form.nome, form.cognome, form.email, form.telefono].every(value => value.trim())) {
        setError("Compila nome, cognome, e-mail e telefono per continuare."); return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setError("Inserisci un indirizzo e-mail valido."); return;
      }
      if (!/^[+()\d\s.-]{6,32}$/.test(form.telefono.trim())) {
        setError("Inserisci un numero di telefono valido."); return;
      }
    }
    setStep(step + 1);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const { error: submitError } = await supabase.functions.invoke("richiesta-contatto", {
        body: {
          nome: form.nome, cognome: form.cognome, email: form.email, telefono: form.telefono,
          indirizzo_interesse: form.indirizzo_interesse, modalita_interesse: form.modalita_interesse,
          messaggio: form.messaggio, informativa_letta: form.informativa_letta,
          consenso_marketing: form.consenso_marketing, website: form.website,
        },
      });
      if (submitError) { setError("Invio non riuscito. Controlla la connessione e riprova."); return; }
      setSuccess(true);
    } catch {
      setError("Invio non riuscito. Controlla la connessione e riprova.");
    } finally {
      setBusy(false);
    }
  };

  if (screen === "dashboard") return <DashboardDemo onExit={() => setScreen("form")} />;

  return <div className="page-shell">
    <div className="demo-banner"><span className="demo-light" /> AMBIENTE DIMOSTRATIVO <span className="demo-separator">·</span> Usa solo dati fittizi durante la prova <button onClick={() => setScreen("dashboard")}>Anteprima gestionale <ArrowRight size={13} /></button></div>
    <header className="site-header"><a href="#inizio" className="brand-link" aria-label="JANUS, inizio"><Brand /></a><nav className="site-nav"><a href="#metodo">Il metodo</a><a href="#percorso">I percorsi</a><a href="https://istitutojanus.it/privacy-policy/" target="_blank" rel="noreferrer">Privacy</a></nav><a className="header-cta" href="#richiesta">Parla con un consulente <ArrowRight size={15} /></a><button className="mobile-menu-btn" aria-label="Apri navigazione"><Menu size={20} /></button></header>
    <main id="inizio">
      <section className="hero-section">
        <div className="hero-copy"><div className="hero-badge"><span className="badge-spark"><Sparkles size={13} /></span> IL TUO PROSSIMO CAPITOLO INIZIA QUI</div><h1>Il diploma che<br />apre nuove <span>possibilità.</span></h1><p className="hero-description">Un percorso costruito intorno ai tuoi obiettivi, con il supporto di tutor e un metodo flessibile.</p><div className="hero-actions"><a className="primary-link" href="#richiesta">Trova il tuo percorso <ArrowRight size={16} /></a><a className="secondary-link" href="#metodo"><span className="play">▶</span> Scopri il metodo</a></div><div className="hero-proof"><div className="proof-avatars"><span>G</span><span>M</span><span>A</span><span>+</span></div><p><b>Un percorso, una guida.</b><br />Al tuo fianco passo dopo passo.</p><div className="proof-divider" /><div className="rating"><span>★★★★★</span><small>Orientamento personalizzato</small></div></div></div>
        <div className="hero-visual"><div className="visual-glow" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="visual-grid" /><div className="visual-card card-progress"><div className="progress-top"><span className="progress-icon"><GraduationCap size={18} /></span><span className="progress-tag">IL TUO PERCORSO</span><span className="more">···</span></div><div className="progress-title">Ogni traguardo<br /><b>è un nuovo inizio.</b></div><div className="progress-caption">Un piano flessibile, costruito su di te.</div><div className="progress-track"><i /></div><div className="progress-bottom"><span>Obiettivo diploma</span><b>in vista <ArrowUpRight size={13} /></b></div></div><div className="floating-card floating-tutor"><span className="tutor-icon"><BookOpen size={17} /></span><div><b>Il tuo tutor</b><small>sempre al tuo fianco</small></div><CheckCircle2 size={16} className="tutor-check" /></div><div className="floating-card floating-flex"><div className="flex-icon"><Sparkles size={16} /></div><span><b>Il tuo ritmo.</b><small>Il tuo futuro.</small></span></div><div className="visual-index">01 <i /> 03</div></div>
      </section>
      <section className="trust-strip" id="metodo"><div><span className="trust-icon"><ShieldCheck size={18} /></span><b>Un supporto concreto</b><small>Ti accompagniamo in ogni fase</small></div><div><span className="trust-icon cyan"><BookOpen size={18} /></span><b>Un metodo flessibile</b><small>Studio organizzato intorno a te</small></div><div><span className="trust-icon green"><GraduationCap size={18} /></span><b>Un obiettivo chiaro</b><small>Il diploma, un passo alla volta</small></div><a href="#percorso" id="percorso">Scopri i percorsi <ArrowRight size={15} /></a></section>
      <section className="form-section" id="richiesta"><div className="form-intro"><div className="eyebrow">ORIENTAMENTO JANUS <span /></div><h2>Cominciamo<br />da <span>te.</span></h2><p>Raccontaci cosa stai cercando. Un consulente ti aiuterà a individuare il percorso più adatto ai tuoi obiettivi.</p><div className="form-assurance"><LockKeyhole size={16} /><span>I dati viaggiano direttamente verso il database JANUS, attraverso una connessione protetta.</span></div><div className="form-note"><CircleHelp size={16} /><span>Questa è una demo tecnica. Usa soltanto dati inventati e non caricare documenti personali.</span></div></div>
        <div className="form-card"><div className="form-card-top"><div><div className="card-overline">RICHIEDI UN ORIENTAMENTO</div><h3>{success ? "Richiesta inviata" : "Il primo passo è semplice."}</h3><p>{success ? "Grazie, abbiamo registrato la tua richiesta dimostrativa." : "Ci vogliono meno di due minuti."}</p></div><div className="form-icon"><ClipboardList size={20} /></div></div>
          {success ? <div className="success-state"><div className="success-check"><Check size={28} /></div><h4>Perfetto, siamo pronti a guidarti.</h4><p>La richiesta di prova è stata salvata. In un ambiente reale, il team JANUS potrà prenderla in carico dalla dashboard.</p><Button variant="secondary" onClick={() => { setForm(initialForm); setStep(1); setSuccess(false); }}>Invia un'altra richiesta demo <ArrowRight size={15} /></Button></div> : <>
            <div className="steps-row"><div className={`step-item ${step >= 1 ? "current" : ""} ${step > 1 ? "done" : ""}`}><span>{step > 1 ? <Check size={13} /> : "01"}</span><b>Contatti</b></div><i className={step > 1 ? "filled" : ""} /><div className={`step-item ${step >= 2 ? "current" : ""} ${step > 2 ? "done" : ""}`}><span>{step > 2 ? <Check size={13} /> : "02"}</span><b>Percorso</b></div><i className={step > 2 ? "filled" : ""} /><div className={`step-item ${step >= 3 ? "current" : ""}`}><span>03</span><b>Conferma</b></div></div>
            <form onSubmit={submit}>
              {step === 1 && <div className="form-fields"><div className="field-grid"><Field id="nome" label="Nome" autoComplete="given-name" placeholder="Il tuo nome" required value={form.nome} onChange={e => update("nome", e.target.value)} /><Field id="cognome" label="Cognome" autoComplete="family-name" placeholder="Il tuo cognome" required value={form.cognome} onChange={e => update("cognome", e.target.value)} /></div><Field id="email" label="E-mail" type="email" autoComplete="email" placeholder="nome@email.it" required value={form.email} onChange={e => update("email", e.target.value)} /><Field id="telefono" label="Telefono" type="tel" autoComplete="tel" placeholder="+39 333 000 0000" required value={form.telefono} onChange={e => update("telefono", e.target.value)} /><label className="honeypot" aria-hidden="true">Lascia vuoto<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e => update("website", e.target.value)} /></label></div>}
              {step === 2 && <div className="form-fields"><label className="field-wrap"><span>Indirizzo di studio che ti interessa <i>FACOLTATIVO</i></span><select className="field" value={form.indirizzo_interesse} onChange={e => update("indirizzo_interesse", e.target.value)}><option value="">Seleziona un percorso</option>{courses.map(course => <option key={course} value={course}>{course}</option>)}</select></label><label className="field-wrap"><span>Modalità di studio <i>FACOLTATIVO</i></span><select className="field" value={form.modalita_interesse} onChange={e => update("modalita_interesse", e.target.value)}><option value="">Quale modalità preferisci?</option><option value="gold_experience">Gold Experience · in presenza a Roma</option><option value="gold_academy_live">Gold Academy Live · online in diretta</option><option value="gold_digital">Gold Digital · online flessibile</option></select></label><label className="field-wrap"><span>Vuoi aggiungere un dettaglio? <i>FACOLTATIVO</i></span><textarea className="field textarea" rows={3} maxLength={1500} placeholder="Ad esempio: il tuo obiettivo o quando preferisci essere contattato" value={form.messaggio} onChange={e => update("messaggio", e.target.value)} /></label></div>}
              {step === 3 && <div className="form-fields"><div className="review-card"><div className="review-head"><span className="review-icon"><ClipboardList size={17} /></span><div><b>Riepilogo richiesta</b><small>Verifica i dati prima dell'invio</small></div></div><div className="review-line"><span>Contatto</span><b>{form.nome} {form.cognome}</b></div><div className="review-line"><span>E-mail</span><b>{form.email}</b></div><div className="review-line"><span>Telefono</span><b>{form.telefono}</b></div>{form.indirizzo_interesse && <div className="review-line"><span>Percorso</span><b>{form.indirizzo_interesse}</b></div>}</div><label className="check-row"><input type="checkbox" required checked={form.informativa_letta} onChange={e => update("informativa_letta", e.target.checked)} /><span>Ho letto l’<a href="https://istitutojanus.it/privacy-policy/" target="_blank" rel="noreferrer">informativa privacy</a> e desidero essere ricontattato per questa richiesta.</span></label><label className="check-row optional"><input type="checkbox" checked={form.consenso_marketing} onChange={e => update("consenso_marketing", e.target.checked)} /><span>Acconsento a ricevere comunicazioni informative e promozionali. <i>Facoltativo</i></span></label><p className="privacy-caption"><LockKeyhole size={13} /> Nessun documento, codice fiscale o dato sanitario viene richiesto in questo modulo.</p></div>}
              {error && <div className="form-error" role="alert">{error}</div>}
              <div className="form-actions">{step > 1 && <Button type="button" variant="secondary" onClick={() => { setError(""); setStep(step - 1); }}><ArrowLeft size={15} /> Indietro</Button>}{step < 3 ? <Button type="button" className="action-next" onClick={advance}>Continua <ArrowRight size={15} /></Button> : <Button type="submit" disabled={busy || !form.informativa_letta}>{busy ? "Invio in corso…" : "Invia richiesta demo"}<ArrowRight size={15} /></Button>}</div>
            </form>
            </>}
          <div className="form-card-footer"><span><LockKeyhole size={13} /> Connessione protetta</span><span>JANUS · Orientamento</span></div>
        </div></section>
    </main>
    <footer className="site-footer"><Brand /><span>Un percorso costruito intorno a te.</span><a href="https://istitutojanus.it/" target="_blank" rel="noreferrer">istitutojanus.it <ArrowUpRight size={13} /></a></footer>
  </div>;
}
