export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  age: number;
  status: "Attivo" | "In iscrizione" | "Sospeso";
  path: string;
  course: string;
  year: string;
  tutorId: string;
  progress: number;
  documentReady: boolean;
  exam: string;
  balance: number;
  enrolled: string;
};
export type Tutor = {
  id: string;
  name: string;
  subjects: string[];
  email: string;
};
export type Activity = {
  id: string;
  studentId: string;
  tutorId: string;
  type: "Telefonata" | "Videochiamata" | "WhatsApp" | "Lezione" | "Assenza";
  date: string;
  minutes: number;
  note: string;
};
export type Operator = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created: string;
};
export type CampusData = {
  students: Student[];
  tutors: Tutor[];
  activities: Activity[];
  operators: Operator[];
};
