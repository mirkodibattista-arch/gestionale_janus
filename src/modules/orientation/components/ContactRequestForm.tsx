import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  ClipboardList,
  LockKeyhole,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Field } from "../../../components/ui/Field";
import { courses, initialForm } from "../data";
import type { OrientationFormController } from "../hooks/useOrientationForm";

export function ContactRequestForm({
  controller,
}: {
  controller: OrientationFormController;
}) {
  const {
    step,
    setStep,
    form,
    setForm,
    busy,
    error,
    setError,
    success,
    setSuccess,
    update,
    advance,
    submit,
  } = controller;
  return (
    <section className="form-section" id="richiesta">
      <div className="form-intro">
        <div className="eyebrow">
          ORIENTAMENTO JANUS <span />
        </div>
        <h2>
          Cominciamo
          <br />
          da <span>te.</span>
        </h2>
        <p>
          Raccontaci cosa stai cercando. Un consulente ti aiuterà a individuare
          il percorso più adatto ai tuoi obiettivi.
        </p>
        <div className="form-assurance">
          <LockKeyhole size={16} />
          <span>
            I dati viaggiano direttamente verso il database JANUS, attraverso
            una connessione protetta.
          </span>
        </div>
        <div className="form-note">
          <CircleHelp size={16} />
          <span>
            Questa è una demo tecnica. Usa soltanto dati inventati e non
            caricare documenti personali.
          </span>
        </div>
      </div>
      <div className="form-card">
        <div className="form-card-top">
          <div>
            <div className="card-overline">RICHIEDI UN ORIENTAMENTO</div>
            <h3>
              {success ? "Richiesta inviata" : "Il primo passo è semplice."}
            </h3>
            <p>
              {success
                ? "Grazie, abbiamo registrato la tua richiesta dimostrativa."
                : "Ci vogliono meno di due minuti."}
            </p>
          </div>
          <div className="form-icon">
            <ClipboardList size={20} />
          </div>
        </div>
        {success ? (
          <div className="success-state">
            <div className="success-check">
              <Check size={28} />
            </div>
            <h4>Perfetto, siamo pronti a guidarti.</h4>
            <p>
              La richiesta di prova è stata salvata. In un ambiente reale, il
              team JANUS potrà prenderla in carico dalla dashboard.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setForm(initialForm);
                setStep(1);
                setSuccess(false);
              }}
            >
              Invia un'altra richiesta demo <ArrowRight size={15} />
            </Button>
          </div>
        ) : (
          <>
            <div className="steps-row">
              <div
                className={`step-item ${step >= 1 ? "current" : ""} ${step > 1 ? "done" : ""}`}
              >
                <span>{step > 1 ? <Check size={13} /> : "01"}</span>
                <b>Contatti</b>
              </div>
              <i className={step > 1 ? "filled" : ""} />
              <div
                className={`step-item ${step >= 2 ? "current" : ""} ${step > 2 ? "done" : ""}`}
              >
                <span>{step > 2 ? <Check size={13} /> : "02"}</span>
                <b>Percorso</b>
              </div>
              <i className={step > 2 ? "filled" : ""} />
              <div className={`step-item ${step >= 3 ? "current" : ""}`}>
                <span>03</span>
                <b>Conferma</b>
              </div>
            </div>
            <form onSubmit={submit}>
              {step === 1 && (
                <div className="form-fields">
                  <div className="field-grid">
                    <Field
                      id="nome"
                      label="Nome"
                      autoComplete="given-name"
                      placeholder="Il tuo nome"
                      required
                      value={form.nome}
                      onChange={(e) => update("nome", e.target.value)}
                    />
                    <Field
                      id="cognome"
                      label="Cognome"
                      autoComplete="family-name"
                      placeholder="Il tuo cognome"
                      required
                      value={form.cognome}
                      onChange={(e) => update("cognome", e.target.value)}
                    />
                  </div>
                  <Field
                    id="email"
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    placeholder="nome@email.it"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  <Field
                    id="telefono"
                    label="Telefono"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+39 333 000 0000"
                    required
                    value={form.telefono}
                    onChange={(e) => update("telefono", e.target.value)}
                  />
                  <label className="honeypot" aria-hidden="true">
                    Lascia vuoto
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                    />
                  </label>
                </div>
              )}
              {step === 2 && (
                <div className="form-fields">
                  <label className="field-wrap">
                    <span>
                      Indirizzo di studio che ti interessa <i>FACOLTATIVO</i>
                    </span>
                    <select
                      className="field"
                      value={form.indirizzo_interesse}
                      onChange={(e) =>
                        update("indirizzo_interesse", e.target.value)
                      }
                    >
                      <option value="">Seleziona un percorso</option>
                      {courses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-wrap">
                    <span>
                      Modalità di studio <i>FACOLTATIVO</i>
                    </span>
                    <select
                      className="field"
                      value={form.modalita_interesse}
                      onChange={(e) =>
                        update("modalita_interesse", e.target.value)
                      }
                    >
                      <option value="">Quale modalità preferisci?</option>
                      <option value="gold_experience">
                        Gold Experience · in presenza a Roma
                      </option>
                      <option value="gold_academy_live">
                        Gold Academy Live · online in diretta
                      </option>
                      <option value="gold_digital">
                        Gold Digital · online flessibile
                      </option>
                    </select>
                  </label>
                  <label className="field-wrap">
                    <span>
                      Vuoi aggiungere un dettaglio? <i>FACOLTATIVO</i>
                    </span>
                    <textarea
                      className="field textarea"
                      rows={3}
                      maxLength={1500}
                      placeholder="Ad esempio: il tuo obiettivo o quando preferisci essere contattato"
                      value={form.messaggio}
                      onChange={(e) => update("messaggio", e.target.value)}
                    />
                  </label>
                </div>
              )}
              {step === 3 && (
                <div className="form-fields">
                  <div className="review-card">
                    <div className="review-head">
                      <span className="review-icon">
                        <ClipboardList size={17} />
                      </span>
                      <div>
                        <b>Riepilogo richiesta</b>
                        <small>Verifica i dati prima dell'invio</small>
                      </div>
                    </div>
                    <div className="review-line">
                      <span>Contatto</span>
                      <b>
                        {form.nome} {form.cognome}
                      </b>
                    </div>
                    <div className="review-line">
                      <span>E-mail</span>
                      <b>{form.email}</b>
                    </div>
                    <div className="review-line">
                      <span>Telefono</span>
                      <b>{form.telefono}</b>
                    </div>
                    {form.indirizzo_interesse && (
                      <div className="review-line">
                        <span>Percorso</span>
                        <b>{form.indirizzo_interesse}</b>
                      </div>
                    )}
                  </div>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      required
                      checked={form.informativa_letta}
                      onChange={(e) =>
                        update("informativa_letta", e.target.checked)
                      }
                    />
                    <span>
                      Ho letto l’
                      <a
                        href="https://istitutojanus.it/privacy-policy/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        informativa privacy
                      </a>{" "}
                      e desidero essere ricontattato per questa richiesta.
                    </span>
                  </label>
                  <label className="check-row optional">
                    <input
                      type="checkbox"
                      checked={form.consenso_marketing}
                      onChange={(e) =>
                        update("consenso_marketing", e.target.checked)
                      }
                    />
                    <span>
                      Acconsento a ricevere comunicazioni informative e
                      promozionali. <i>Facoltativo</i>
                    </span>
                  </label>
                  <p className="privacy-caption">
                    <LockKeyhole size={13} /> Nessun documento, codice fiscale o
                    dato sanitario viene richiesto in questo modulo.
                  </p>
                </div>
              )}
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              <div className="form-actions">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setError("");
                      setStep(step - 1);
                    }}
                  >
                    <ArrowLeft size={15} /> Indietro
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    className="action-next"
                    onClick={advance}
                  >
                    Continua <ArrowRight size={15} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={busy || !form.informativa_letta}
                  >
                    {busy ? "Invio in corso…" : "Invia richiesta demo"}
                    <ArrowRight size={15} />
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
        <div className="form-card-footer">
          <span>
            <LockKeyhole size={13} /> Connessione protetta
          </span>
          <span>JANUS · Orientamento</span>
        </div>
      </div>
    </section>
  );
}
