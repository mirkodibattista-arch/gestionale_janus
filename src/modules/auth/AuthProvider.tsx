import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createDemoAuthService, DEMO_SESSION_KEY } from "./demoAuthService";
import type { AuthSession } from "./types";

// Disattivare la demo non attiva automaticamente il backend reale.
const demoEnabled = (import.meta.env.VITE_AUTH_MODE ?? "demo") === "demo";
const service = createDemoAuthService({
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: (key) => window.localStorage.removeItem(key),
});
type AuthContextValue = {
  session: AuthSession | null;
  demoEnabled: boolean;
  signIn: (email: string, password: string) => Promise<AuthSession>;
  signOut: () => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    demoEnabled ? service.getSession() : null,
  );
  useEffect(() => {
    const refresh = () => setSession(demoEnabled ? service.getSession() : null);
    const onStorage = (event: StorageEvent) => {
      if (event.key === DEMO_SESSION_KEY || event.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    const timer = session
      ? window.setTimeout(refresh, Math.max(0, session.expiresAt - Date.now()))
      : undefined;
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [session?.expiresAt]);

  const signIn = async (email: string, password: string) => {
    if (!demoEnabled)
      throw new Error(
        "Accesso non configurato. La modalità demo è disattivata.",
      );
    const authenticated = await service.signIn(email, password);
    setSession(authenticated);
    return authenticated;
  };
  const signOut = () => {
    service.signOut();
    setSession(null);
  };
  return (
    <AuthContext.Provider value={{ session, demoEnabled, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth richiede AuthProvider.");
  return context;
}
