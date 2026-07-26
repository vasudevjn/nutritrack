import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { dateRangeISO } from "@/lib/dates";
import type { AnalyticsDay } from "@/types/database";

export async function GET(request: Request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") === "30d" ? "30d" : "7d";
  const dates = dateRangeISO(range);
  const start = dates[0];
  const end = dates[dates.length - 1];

  const [{ data: meals, error: mealsError }, { data: weights, error: weightError }, { data: goals }] =
    await Promise.all([
      supabase
        .from("meals")
        .select("logged_on, calories, protein_g, carbs_g, fat_g")
        .eq("user_id", user.id)
        .gte("logged_on", start)
        .lte("logged_on", end),
      supabase
        .from("weight_logs")
        .select("logged_on, weight_kg")
        .eq("user_id", user.id)
        .gte("logged_on", start)
        .lte("logged_on", end)
        .order("created_at", { ascending: false }),
      supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

  if (mealsError) return jsonError(mealsError.message, 500);
  if (weightError) return jsonError(weightError.message, 500);

  const byDate = new Map<string, AnalyticsDay>();
  for (const date of dates) {
    byDate.set(date, {
      date,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      weight_kg: null,
    });
  }

  for (const meal of meals || []) {
    const row = byDate.get(meal.logged_on);
    if (!row) continue;
    row.calories += Number(meal.calories || 0);
    row.protein_g += Number(meal.protein_g || 0);
    row.carbs_g += Number(meal.carbs_g || 0);
    row.fat_g += Number(meal.fat_g || 0);
  }

  for (const w of weights || []) {
    const row = byDate.get(w.logged_on);
    if (row && row.weight_kg == null) {
      row.weight_kg = Number(w.weight_kg);
    }
  }

  return NextResponse.json({
    range,
    days: Array.from(byDate.values()),
    goals: goals || null,
  });
}
