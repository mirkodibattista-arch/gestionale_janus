import { createClient } from "@supabase/supabase-js";
import { stagingUrl } from "../../../supabase/functions/_shared/janusOrientation";
import { isStagingAuthConfig } from "./stagingConfig";

export const realStorageKey = "janus.staging.auth.v1";
const { VITE_AUTH_MODE, VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY } = import.meta.env;

export const authPublishableKey = VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
export const realClient = VITE_AUTH_MODE === "supabase"
  && isStagingAuthConfig(VITE_SUPABASE_URL, authPublishableKey)
  ? createClient(stagingUrl, authPublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: {
          getItem: (key) => window.sessionStorage.getItem(key),
          setItem: (key, value) => window.sessionStorage.setItem(key, value),
          removeItem: (key) => window.sessionStorage.removeItem(key),
        },
        storageKey: realStorageKey,
      },
    })
  : null;
