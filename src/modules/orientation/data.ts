import type { FormState } from "./types";

export const initialForm: FormState = {
  nome: "",
  cognome: "",
  email: "",
  telefono: "",
  indirizzo_interesse: "",
  modalita_interesse: "",
  messaggio: "",
  informativa_letta: false,
  consenso_marketing: false,
  website: "",
};

export const courses = [
  "Liceo Scientifico",
  "Liceo Scientifico Sportivo",
  "Liceo Scienze Applicate",
  "Liceo Classico",
  "Liceo Linguistico",
  "Liceo Scienze Umane",
  "Liceo Economico Sociale",
  "Istituto Tecnico Tecnologico Informatico",
  "Amministrazione Finanza e Marketing",
  "Istituto Professionale Socio Sanitario",
  "Istituto Tecnico del Turismo",
  "Istituto Tecnico MME",
  "Enogastronomia e Ospitalità Alberghiera",
];
