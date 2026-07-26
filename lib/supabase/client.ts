import { createBrowserClient } from "@supabase/ssr";
import { authCookieOptions, getSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill in your keys.",
    );
  }

  return createBrowserClient(env.url, env.anonKey, {
    cookieOptions: authCookieOptions,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
