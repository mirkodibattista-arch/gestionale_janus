import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { canReadOrientation } from "../../../supabase/functions/_shared/janusOrientation";
import { orientationApi, OrientationError } from "../orientation-inbox/api";
import { authPublishableKey, realStorageKey, type realClient } from "./realAuth";
import type { AuthSession } from "./types";

type AuthorizedSession = { session: AuthSession; token: string };
const genericError = "Accesso temporaneamente non disponibile. Riprova.";

export function useRealAuth(client: NonNullable<typeof realClient>) {
  const [authorized, setAuthorized] = useState<AuthorizedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const active = useRef<AbortController | null>(null);
  const signingIn = useRef(false);
  const signingOut = useRef(false);

  const clear = useCallback(() => {
    active.current?.abort();
    active.current = null;
    setAuthorized(null);
    setLoading(false);
  }, []);

  const resolve = useCallback(async (credentials: Session) => {
    active.current?.abort();
    const attempt = new AbortController();
    active.current = attempt;
    const expiresAt = (credentials.expires_at ?? 0) * 1000;
    try {
      if (expiresAt <= Date.now()) throw new OrientationError(401);
      const profile = await orientationApi(authPublishableKey, credentials.access_token,
        { action: "profile" }, attempt.signal);
      if (attempt.signal.aborted) throw new DOMException("Accesso interrotto", "AbortError");
      if (profile.id !== credentials.user.id || !canReadOrientation(profile.role)) {
        throw new OrientationError(403);
      }
      if (expiresAt <= Date.now()) throw new OrientationError(401);
      const session: AuthSession = {
        user: { id: profile.id, email: credentials.user.email ?? "", displayName: profile.role },
        role: profile.role,
        mode: "supabase",
        expiresAt,
      };
      setAuthorized({ session, token: credentials.access_token });
      setNotice("");
      return session;
    } catch (cause) {
      if (!attempt.signal.aborted) {
        setAuthorized(null);
        setNotice(cause instanceof OrientationError ? cause.message : genericError);
      }
      throw cause;
    } finally {
      if (active.current === attempt) {
        active.current = null;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = client.auth.onAuthStateChange((event, credentials) => {
      if (event === "SIGNED_OUT" || !credentials) {
        clear();
      } else if (!signingIn.current && !signingOut.current
        && ["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) {
        // La risoluzione usa fetch e non rientra nel lock del client Auth.
        void resolve(credentials).catch(() => {});
      }
    });
    return () => {
      subscription.unsubscribe();
      active.current?.abort();
    };
  }, [client, clear, resolve]);

  useEffect(() => {
    if (!authorized) return;
    const expiresAt = authorized.session.expiresAt;
    const expire = () => {
      if (Date.now() >= expiresAt) {
        setAuthorized((current) => current === authorized ? null : current);
      }
    };
    const timer = window.setTimeout(expire, Math.max(0, expiresAt - Date.now()));
    window.addEventListener("focus", expire);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", expire);
    };
  }, [authorized]);

  const signOut = useCallback(async () => {
    signingOut.current = true;
    clear();
    setNotice("");
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch {
      try {
        window.sessionStorage.removeItem(realStorageKey);
      } catch {
        // Il browser può bloccare l'accesso allo storage.
      }
      setNotice("Uscita locale completata. La revoca remota non è stata confermata.");
    } finally {
      signingOut.current = false;
    }
  }, [client, clear]);

  const signIn = async (email: string, password: string) => {
    if (signingOut.current) throw new Error("Uscita in corso. Riprova tra poco.");
    signingIn.current = true;
    active.current?.abort();
    setNotice("");
    try {
      const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.session) throw new Error("Accesso non riuscito. Verifica le credenziali.");
      try {
        return await resolve(data.session);
      } catch (cause) {
        await signOut();
        throw new Error(cause instanceof OrientationError ? cause.message : genericError);
      }
    } finally {
      signingIn.current = false;
    }
  };

  return {
    session: authorized?.session ?? null,
    token: authorized?.token ?? null,
    loading,
    notice,
    signIn,
    signOut,
  };
}
