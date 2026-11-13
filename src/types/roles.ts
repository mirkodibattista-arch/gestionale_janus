export const roles = [
  "Admin",
  "Supervisore",
  "Segreteria",
  "Amministrazione",
  "Didattica",
  "Tutor",
  "Studente",
  "Audit",
] as const;
export type Role = (typeof roles)[number];
