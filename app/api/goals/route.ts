import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { ageFromBirthdate, estimateBmr, minSafeCalories } from "@/lib/nutrition";
import { goalsSchema, onboardingSchema } from "@/lib/validations";
import type { Sex } from "@/types/database";

function clampDeficitTarget(input: {
  calorie_goal_type: "maintenance" | "deficit" | "surplus";
  calorie_target: number;
  weekly_weight_change_kg: number;
  sex?: Sex | null;
  bmr?: number | null;
}) {
  const weekly =
    input.calorie_goal_type === "maintenance"
      ? 0
      : input.calorie_goal_type === "deficit"
        ? Math.min(input.weekly_weight_change_kg, 0.75)
        : input.weekly_weight_change_kg;

  if (input.calorie_goal_type !== "deficit") {
    return { calorie_target: input.calorie_target, weekly_weight_change_kg: weekly };
  }

  const floor = minSafeCalories({ sex: input.sex, bmr: input.bmr });
  return {
    calorie_target: Math.max(floor, input.calorie_target),
    weekly_weight_change_kg: weekly,
  };
}

export async function GET() {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ goals: data });
}

export async function PUT(request: Request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const body = await request.json();

  // Full onboarding payload (profile + goals)
  if (body.onboarding === true) {
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid onboarding data");
    }

    const d = parsed.data;
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: d.full_name,
        sex: d.sex,
        height_cm: d.height_cm,
        birthdate: d.birthdate,
        activity_level: d.activity_level,
        onboarding_complete: true,
      })
      .eq("id", user.id);

    if (profileError) return jsonError(profileError.message, 500);

    const bmr = estimateBmr({
      sex: d.sex,
      weightKg: d.weight_kg,
      heightCm: d.height_cm,
      age: ageFromBirthdate(d.birthdate),
    });
    const safe = clampDeficitTarget({
      calorie_goal_type: d.calorie_goal_type,
      calorie_target: d.calorie_target,
      weekly_weight_change_kg: d.weekly_weight_change_kg,
      sex: d.sex,
      bmr,
    });

    const { data: goals, error: goalsError } = await supabase
      .from("goals")
      .upsert({
        user_id: user.id,
        calorie_target: safe.calorie_target,
        protein_g: d.protein_g,
        carbs_g: d.carbs_g,
        fat_g: d.fat_g,
        water_ml: d.water_ml,
        weight_target_kg: d.weight_target_kg ?? d.weight_kg,
        calorie_goal_type: d.calorie_goal_type,
        weekly_weight_change_kg: safe.weekly_weight_change_kg,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (goalsError) return jsonError(goalsError.message, 500);

    // Seed initial weight log
    await supabase.from("weight_logs").insert({
      user_id: user.id,
      weight_kg: d.weight_kg,
      logged_on: new Date().toISOString().slice(0, 10),
    });

    return NextResponse.json({ goals });
  }

  const parsed = goalsSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid goals");

  const { data: profile } = await supabase
    .from("profiles")
    .select("sex, height_cm, birthdate")
    .eq("id", user.id)
    .maybeSingle();

  const { data: latestWeight } = await supabase
    .from("weight_logs")
    .select("weight_kg")
    .eq("user_id", user.id)
    .order("logged_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sex = (profile?.sex as Sex | null) ?? null;
  const bmr =
    sex && profile?.height_cm && profile?.birthdate && latestWeight?.weight_kg != null
      ? estimateBmr({
          sex,
          weightKg: Number(latestWeight.weight_kg),
          heightCm: Number(profile.height_cm),
          age: ageFromBirthdate(profile.birthdate),
        })
      : null;

  const safe = clampDeficitTarget({
    calorie_goal_type: parsed.data.calorie_goal_type,
    calorie_target: parsed.data.calorie_target,
    weekly_weight_change_kg: parsed.data.weekly_weight_change_kg,
    sex,
    bmr,
  });

  const { data, error } = await supabase
    .from("goals")
    .upsert({
      user_id: user.id,
      ...parsed.data,
      calorie_target: safe.calorie_target,
      weekly_weight_change_kg: safe.weekly_weight_change_kg,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ goals: data });
}
