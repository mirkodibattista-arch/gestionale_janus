import type { Role } from "../../types/roles";

export type AuthSession = {
  user: { id: string; email: string; displayName: string };
  role: Role;
  scope?: {
    studentId?: string;
    tutorId?: string;
    auditStudentIds?: readonly string[];
  };
  mode: "demo";
  expiresAt: number;
};

// Il servizio demo è sostituibile da un adapter reale; i componenti non
// verificano credenziali e non ricavano mai il ruolo dal testo dell'email.
export interface AuthService {
  getSession(): AuthSession | null;
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): void;
}
