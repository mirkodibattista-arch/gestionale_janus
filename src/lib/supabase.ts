import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  console.warn("Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.");
}

export const supabase = createClient(
  supabaseUrl || "https://example.supabase.co",
  publishableKey || "missing-publishable-key",
  { auth: { persistSession: false, autoRefreshToken: false } },
);
