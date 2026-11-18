import { stagingUrl } from "../../../supabase/functions/_shared/janusOrientation";

export function isStagingAuthConfig(url?: string, publishableKey?: string): boolean {
  return url === stagingUrl && /^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey ?? "");
}
