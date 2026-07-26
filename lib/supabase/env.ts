export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

/** Long-lived cookies so users stay signed in until they click Sign out. */
export const authCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 400, // ~400 days (refresh token lifetime)
};
