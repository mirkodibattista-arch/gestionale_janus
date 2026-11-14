import { DEMO_PASSWORD_HASH, demoAccounts } from "./demoAccounts";
import type { AuthService, AuthSession } from "./types";

export const DEMO_SESSION_KEY = "janus.demo-auth.v1";
export const DEMO_SESSION_DURATION = 8 * 60 * 60 * 1000;
type SessionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createDemoAuthService(
  storage: SessionStorage,
  now = Date.now,
): AuthService {
  const clear = () => {
    try {
      storage.removeItem(DEMO_SESSION_KEY);
    } catch {
      /* Storage indisponibile: nessuna sessione ripristinabile. */
    }
  };
  const restore = (): AuthSession | null => {
    try {
      const raw = storage.getItem(DEMO_SESSION_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      const account = demoAccounts.find(
        (item) => item.id === saved?.accountId && item.active,
      );
      if (
        saved?.version !== 1 ||
        !account ||
        !Number.isFinite(saved.issuedAt) ||
        saved.issuedAt > now() ||
        saved.issuedAt + DEMO_SESSION_DURATION <= now()
      ) {
        clear();
        return null;
      }
      // Il ruolo è risolto dal record dell'account, mai da un valore di ruolo
      // nel localStorage. Tutto il client resta comunque manipolabile in demo.
      return {
        user: {
          id: account.id,
          email: account.email,
          displayName: account.displayName,
        },
        role: account.role,
        scope: account.scope,
        mode: "demo",
        expiresAt: saved.issuedAt + DEMO_SESSION_DURATION,
      };
    } catch {
      clear();
      return null;
    }
  };
  return {
    getSession: restore,
    async signIn(email, password) {
      const account = demoAccounts.find(
        (item) => item.email === email.trim().toLowerCase(),
      );
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(password),
      );
      const hash = Array.from(new Uint8Array(digest), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      if (!account || hash !== DEMO_PASSWORD_HASH)
        throw new Error("Email o password demo non corretti.");
      if (!account.active)
        throw new Error("Account demo non attivo. Contatta l’amministratore.");
      try {
        storage.setItem(
          DEMO_SESSION_KEY,
          JSON.stringify({
            version: 1,
            accountId: account.id,
            issuedAt: now(),
          }),
        );
      } catch {
        throw new Error(
          "Il browser non consente di salvare la sessione. Abilita l’archiviazione locale e riprova.",
        );
      }
      const session = restore();
      if (!session)
        throw new Error("Impossibile avviare la sessione demo. Riprova.");
      return session;
    },
    signOut: clear,
  };
}
