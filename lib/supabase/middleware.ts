import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authCookieOptions, getSupabaseEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const env = getSupabaseEnv();

  // Avoid crashing the whole app when env is missing; send users to login with a hint.
  if (!env) {
    const pathname = request.nextUrl.pathname;
    const isAsset =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/icon") ||
      /\.(?:svg|png|jpg|jpeg|gif|webp)$/.test(pathname);

    if (!isAsset && pathname !== "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "missing_env");
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...authCookieOptions,
            ...options,
          }),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isPublic =
    isAuthRoute ||
    pathname.startsWith("/auth") ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api");

  if (!user && !isPublic && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (
    user &&
    !isAuthRoute &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/api")
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .maybeSingle();

    const onboarded = profile?.onboarding_complete === true;

    if (!onboarded && !isOnboarding && pathname !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    if (onboarded && isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
