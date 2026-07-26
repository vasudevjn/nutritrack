import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { authCookieOptions, getSupabaseEnv } from "@/lib/supabase/env";

export async function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill in your keys.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, { ...authCookieOptions, ...options }),
          );
        } catch {
          // Called from a Server Component — proxy will refresh sessions.
        }
      },
    },
  });
}
