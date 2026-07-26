import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { goalsSchema, onboardingSchema } from "@/lib/validations";

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

    const { data: goals, error: goalsError } = await supabase
      .from("goals")
      .upsert({
        user_id: user.id,
        calorie_target: d.calorie_target,
        protein_g: d.protein_g,
        carbs_g: d.carbs_g,
        fat_g: d.fat_g,
        water_ml: d.water_ml,
        weight_target_kg: d.weight_target_kg ?? d.weight_kg,
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

  const { data, error } = await supabase
    .from("goals")
    .upsert({
      user_id: user.id,
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ goals: data });
}
