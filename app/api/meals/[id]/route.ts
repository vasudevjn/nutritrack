import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { sumMacros } from "@/lib/nutrition";
import { createMealSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const body = await request.json();
  const parsed = createMealSchema.partial().safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid meal");

  const { data: existing } = await supabase
    .from("meals")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return jsonError("Meal not found", 404);

  const updates: Record<string, unknown> = {};
  if (parsed.data.meal_type) updates.meal_type = parsed.data.meal_type;
  if (parsed.data.name) updates.name = parsed.data.name;
  if (parsed.data.raw_input !== undefined) updates.raw_input = parsed.data.raw_input;
  if (parsed.data.logged_on) updates.logged_on = parsed.data.logged_on;

  if (parsed.data.items) {
    const totals = sumMacros(parsed.data.items);
    updates.calories = totals.calories;
    updates.protein_g = totals.protein_g;
    updates.carbs_g = totals.carbs_g;
    updates.fat_g = totals.fat_g;

    await supabase.from("meal_items").delete().eq("meal_id", id);
    await supabase
      .from("meal_items")
      .insert(parsed.data.items.map((item) => ({ ...item, meal_id: id })));
  }

  const { data, error } = await supabase
    .from("meals")
    .update(updates)
    .eq("id", id)
    .select("*, meal_items(*)")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ meal: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const { error } = await supabase
    .from("meals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
