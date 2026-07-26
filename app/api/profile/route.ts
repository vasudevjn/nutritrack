import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ profile: data });
}

export async function PATCH(request: Request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid input");

  const { data, error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ profile: data });
}
