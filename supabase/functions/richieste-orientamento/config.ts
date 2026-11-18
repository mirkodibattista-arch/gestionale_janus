import { stagingRef, stagingUrl } from "../_shared/janusOrientation.ts";

export const edgeLogin = "janus_orientation_edge";
export const databaseHost = `db.${stagingRef}.supabase.co`;

export function parseDatabaseUrl(value: string): URL {
  const url = new URL(value);
  if (
    url.protocol !== "postgresql:" || url.hostname !== databaseHost ||
    url.port !== "5432" || url.pathname !== "/postgres" ||
    url.username !== edgeLogin || !url.password || url.search || url.hash
  ) {
    throw new Error("Configurazione PostgreSQL staging non valida.");
  }
  return url;
}

export function parseOrigins(raw: string): Set<string> {
  const origins = new Set(
    raw.split(",").map((value) => value.trim()).filter(Boolean),
  );
  if (origins.size === 0) throw new Error("Configurare le origini staging.");
  for (const value of origins) {
    const url = new URL(value);
    const local = url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname);
    if (url.origin !== value || (url.protocol !== "https:" && !local)) {
      throw new Error("Origine staging non valida.");
    }
  }
  return origins;
}

export function verifiedUserId(
  claims: Record<string, unknown> | undefined,
  now = Date.now(),
): string | null {
  if (
    claims?.iss !== `${stagingUrl}/auth/v1` || claims.aud !== "authenticated" ||
    claims.role !== "authenticated" || claims.is_anonymous === true ||
    typeof claims.exp !== "number" || !Number.isSafeInteger(claims.exp) ||
    claims.exp * 1000 <= now ||
    typeof claims.sub !== "string"
  ) return null;
  return claims.sub;
}
