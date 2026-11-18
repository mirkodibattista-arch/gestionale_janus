import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { isStagingAuthConfig } from "./src/modules/auth/stagingConfig";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");
  if (env.VITE_AUTH_MODE === "supabase"
    && !isStagingAuthConfig(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY)) {
    throw new Error("Il login Supabase richiede l'URL staging JANUS e la relativa chiave pubblicabile.");
  }
  return { plugins: [react(), tailwindcss()] };
});
