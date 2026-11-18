export const stagingRef = "rwaotjfhiyhndlgljuuo";
export const stagingUrl = `https://${stagingRef}.supabase.co`;
export const orientationPath = "/campus/richieste-orientamento";
export const readingRoles = ["Admin", "Supervisore", "Segreteria"] as const;
export const statuses = [
  "nuova",
  "contattata",
  "in_valutazione",
  "chiusa",
] as const;
export const modalities = [
  "gold_experience",
  "gold_academy_live",
  "gold_digital",
] as const;
export const pageSize = 20;
export const maxPage = 1000;
export const maxSearchLength = 120;

export type ReadingRole = (typeof readingRoles)[number];
export type RequestStatus = (typeof statuses)[number];
export type Modality = (typeof modalities)[number];

export function canReadOrientation(role: unknown): role is ReadingRole {
  return readingRoles.some((allowed) => allowed === role);
}

export type Profile = { id: string; role: ReadingRole };
export type RequestRow = {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  indirizzo_interesse: string | null;
  modalita_interesse: Modality | null;
  ricevuta_il: string;
  stato: RequestStatus;
};
export type RequestDetail = RequestRow & { messaggio: string | null };
export type RequestListing = {
  items: RequestRow[];
  total: number;
  counts: Record<RequestStatus, number>;
};

export type ListFilters = {
  page: number;
  search: string;
  status: RequestStatus | "";
  modality: Modality | "";
};

export type OrientationAction =
  | { action: "profile" }
  | ({ action: "list" } & ListFilters)
  | { action: "detail"; id: string };
