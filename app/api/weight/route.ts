import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { todayISO } from "@/lib/dates";
import { weightSchema } from "@/lib/validations";

export async function GET() {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ logs: data || [] });
}

export async function POST(request: Request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const body = await request.json();
  const parsed = weightSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid weight");

  const { data, error } = await supabase
    .from("weight_logs")
    .insert({
      user_id: user.id,
      weight_kg: parsed.data.weight_kg,
      note: parsed.data.note ?? null,
      logged_on: parsed.data.logged_on || todayISO(),
    })
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ log: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return jsonError("Missing id");

  const { error } = await supabase
    .from("weight_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
