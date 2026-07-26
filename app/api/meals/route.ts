import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { todayISO } from "@/lib/dates";
import { sumMacros } from "@/lib/nutrition";
import { createMealSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || todayISO();

  const { data, error } = await supabase
    .from("meals")
    .select("*, meal_items(*)")
    .eq("user_id", user.id)
    .eq("logged_on", date)
    .order("logged_at", { ascending: true });

  if (error) return jsonError(error.message, 500);

  const totals = sumMacros(data || []);
  return NextResponse.json({ meals: data || [], totals, date });
}

export async function POST(request: Request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const body = await request.json();
  const parsed = createMealSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid meal");
  }

  const { items, meal_type, raw_input, logged_on } = parsed.data;
  const totals = sumMacros(items);
  const name =
    parsed.data.name ||
    items
      .slice(0, 3)
      .map((i) => i.name)
      .join(", ");

  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .insert({
      user_id: user.id,
      name,
      meal_type,
      raw_input: raw_input ?? null,
      logged_on: logged_on || todayISO(),
      calories: totals.calories,
      protein_g: totals.protein_g,
      carbs_g: totals.carbs_g,
      fat_g: totals.fat_g,
    })
    .select("*")
    .single();

  if (mealError || !meal) return jsonError(mealError?.message || "Failed to save meal", 500);

  const { data: mealItems, error: itemsError } = await supabase
    .from("meal_items")
    .insert(items.map((item) => ({ ...item, meal_id: meal.id })))
    .select("*");

  if (itemsError) return jsonError(itemsError.message, 500);

  return NextResponse.json({ meal: { ...meal, meal_items: mealItems } }, { status: 201 });
}
