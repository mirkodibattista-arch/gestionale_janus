import { useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase";
import { initialForm } from "../data";
import type { FormState } from "../types";

export function useOrientationForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  const advance = () => {
    setError("");
    if (step === 1) {
      if (
        ![form.nome, form.cognome, form.email, form.telefono].every((value) =>
          value.trim(),
        )
      ) {
        setError("Compila nome, cognome, e-mail e telefono per continuare.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setError("Inserisci un indirizzo e-mail valido.");
        return;
      }
      if (!/^[+()\d\s.-]{6,32}$/.test(form.telefono.trim())) {
        setError("Inserisci un numero di telefono valido.");
        return;
      }
    }
    setStep(step + 1);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error: submitError } = await supabase.functions.invoke(
        "richiesta-contatto",
        {
          body: {
            nome: form.nome,
            cognome: form.cognome,
            email: form.email,
            telefono: form.telefono,
            indirizzo_interesse: form.indirizzo_interesse,
            modalita_interesse: form.modalita_interesse,
            messaggio: form.messaggio,
            informativa_letta: form.informativa_letta,
            consenso_marketing: form.consenso_marketing,
            website: form.website,
          },
        },
      );
      if (submitError) {
        setError("Invio non riuscito. Controlla la connessione e riprova.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Invio non riuscito. Controlla la connessione e riprova.");
    } finally {
      setBusy(false);
    }
  };

  return {
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
  };
}

export type OrientationFormController = ReturnType<typeof useOrientationForm>;
