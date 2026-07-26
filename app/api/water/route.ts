import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { todayISO } from "@/lib/dates";
import { waterSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || todayISO();

  const { data, error } = await supabase
    .from("water_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("logged_on", date)
    .order("created_at", { ascending: true });

  if (error) return jsonError(error.message, 500);

  const total_ml = (data || []).reduce((sum, row) => sum + Number(row.amount_ml), 0);
  return NextResponse.json({ logs: data || [], total_ml, date });
}

export async function POST(request: Request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const body = await request.json().catch(() => ({}));
  const parsed = waterSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid water log");

  const { data, error } = await supabase
    .from("water_logs")
    .insert({
      user_id: user.id,
      amount_ml: parsed.data.amount_ml ?? 250,
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
  const date = searchParams.get("date") || todayISO();

  const { data: latest, error: findError } = await supabase
    .from("water_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("logged_on", date)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) return jsonError(findError.message, 500);
  if (!latest) return jsonError("No water logs to undo", 404);

  const { error } = await supabase
    .from("water_logs")
    .delete()
    .eq("id", latest.id)
    .eq("user_id", user.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
