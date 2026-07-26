import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, errorResponse: jsonError("Unauthorized", 401) };
  }

  return { supabase, user, errorResponse: null };
}
