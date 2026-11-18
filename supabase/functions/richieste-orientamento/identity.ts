import type { SupabaseClient } from "npm:@supabase/supabase-js@2.95.0";
import { verifiedUserId } from "./config.ts";

export function createIdentityVerifier(
  auth: Pick<SupabaseClient["auth"], "getClaims">,
) {
  return async (jwt: string): Promise<string | null> => {
    try {
      // getClaims può lanciare un Error generico per exp. Applichiamo la
      // scadenza in verifiedUserId, immediatamente dopo la verifica della firma.
      const { data, error } = await auth.getClaims(jwt, { allowExpired: true });
      if (error) {
        if (
          (error.status ?? 0) >= 500 || error.name === "AuthRetryableFetchError"
        ) throw error;
        return null;
      }
      return verifiedUserId(data?.claims);
    } catch (error) {
      if (error instanceof SyntaxError) return null;
      throw error;
    }
  };
}
