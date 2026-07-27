import type { CalorieGoalType, Sex } from "@/types/database";

/** Approx. kcal in 1 kg of body weight */
export const KCAL_PER_KG = 7700;

/**
 * ACSM-style upper bound on daily deficit (~0.9 kg/week).
 * Larger cuts are hard to sustain and raise nutrient-deficiency risk.
 */
export const MAX_DAILY_DEFICIT_KCAL = 1000;

export const WEEKLY_RATE_OPTIONS = [
  { value: 0.25, label: "0.25 kg / Week (Gentle)" },
  { value: 0.5, label: "0.5 kg / Week (Recommended)" },
  { value: 0.75, label: "0.75 kg / Week" },
  { value: 1, label: "1.0 kg / Week" },
] as const;

/** Deficit options stop at 0.75 kg/week — safer long-term rate for most adults. */
export const DEFICIT_WEEKLY_RATE_OPTIONS = WEEKLY_RATE_OPTIONS.filter(
  (opt) => opt.value <= 0.75,
);

export const SURPLUS_WEEKLY_RATE_OPTIONS = WEEKLY_RATE_OPTIONS;

export const CALORIE_GOAL_TYPE_ITEMS = [
  { value: "deficit", label: "Lose Weight (Deficit)" },
  { value: "maintenance", label: "Maintain Weight" },
  { value: "surplus", label: "Gain Weight (Surplus)" },
] as const;

/** Sex-based floors commonly used in clinical weight-management guidance. */
export function sexCalorieFloor(sex: Sex | null | undefined): number {
  if (sex === "male") return 1500;
  if (sex === "female") return 1200;
  return 1350;
}

export function estimateBmr(input: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const { sex, weightKg, heightCm, age } = input;
  const s = sex === "male" ? 5 : sex === "female" ? -161 : -78;
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + s);
}

/**
 * Never prescribe below sex floor or estimated BMR — both are common
 * safety guardrails for unsupervised calorie targets.
 */
export function minSafeCalories(input: {
  sex?: Sex | null;
  bmr?: number | null;
}): number {
  const floor = sexCalorieFloor(input.sex);
  const bmrFloor = input.bmr != null && input.bmr > 0 ? Math.round(input.bmr) : 0;
  return Math.max(floor, bmrFloor);
}

export function maintenanceCalories(input: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: number;
}): number {
  return Math.round(estimateBmr(input) * input.activityLevel);
}

/** Daily calorie delta from weekly kg change (≈7700 kcal per kg). */
export function dailyCalorieDelta(weeklyKg: number): number {
  return Math.round((Math.abs(weeklyKg) * KCAL_PER_KG) / 7);
}

export function applyCaloriePlan(input: {
  maintenance: number;
  goalType: CalorieGoalType;
  weeklyWeightChangeKg: number;
  sex?: Sex | null;
  bmr?: number | null;
}): {
  calorie_target: number;
  maintenance: number;
  daily_delta: number;
  requested_daily_delta: number;
  min_calories: number;
  clamped: boolean;
  effective_weekly_kg: number;
} {
  const weekly =
    input.goalType === "maintenance" ? 0 : Math.abs(input.weeklyWeightChangeKg);
  const requested_daily_delta = dailyCalorieDelta(weekly);
  const min_calories = minSafeCalories({ sex: input.sex, bmr: input.bmr });
  let calorie_target = input.maintenance;
  let daily_delta = 0;
  let clamped = false;

  if (input.goalType === "deficit") {
    const maxFromFloor = Math.max(0, input.maintenance - min_calories);
    const allowedDelta = Math.min(
      requested_daily_delta,
      MAX_DAILY_DEFICIT_KCAL,
      maxFromFloor,
    );
    daily_delta = allowedDelta;
    calorie_target = Math.max(min_calories, input.maintenance - allowedDelta);
    clamped =
      allowedDelta < requested_daily_delta ||
      Math.round(input.maintenance - requested_daily_delta) < calorie_target;
  } else if (input.goalType === "surplus") {
    daily_delta = requested_daily_delta;
    calorie_target = input.maintenance + requested_daily_delta;
  }

  const effective_weekly_kg =
    daily_delta <= 0 ? 0 : Math.round((daily_delta * 7) / KCAL_PER_KG * 100) / 100;

  return {
    maintenance: input.maintenance,
    daily_delta,
    requested_daily_delta,
    min_calories,
    clamped,
    effective_weekly_kg,
    calorie_target: Math.round(calorie_target),
  };
}

export function macrosFromCalories(calories: number) {
  return {
    protein_g: Math.round((calories * 0.3) / 4),
    carbs_g: Math.round((calories * 0.4) / 4),
    fat_g: Math.round((calories * 0.3) / 9),
  };
}

/** Mifflin–St Jeor BMR × activity, then deficit/surplus/maintenance. */
export function suggestGoals(input: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: number;
  goalType?: CalorieGoalType;
  weeklyWeightChangeKg?: number;
}) {
  const goalType = input.goalType ?? "maintenance";
  const weeklyWeightChangeKg =
    goalType === "maintenance" ? 0 : (input.weeklyWeightChangeKg ?? 0.5);

  const bmr = estimateBmr(input);
  const maintenance = Math.round(bmr * input.activityLevel);
  const plan = applyCaloriePlan({
    maintenance,
    goalType,
    weeklyWeightChangeKg,
    sex: input.sex,
    bmr,
  });
  const macros = macrosFromCalories(plan.calorie_target);
  const water_ml = Math.round(input.weightKg * 35);

  return {
    calorie_goal_type: goalType,
    weekly_weight_change_kg: weeklyWeightChangeKg,
    maintenance_calories: plan.maintenance,
    daily_calorie_delta: plan.daily_delta,
    calorie_target: plan.calorie_target,
    min_calories: plan.min_calories,
    clamped: plan.clamped,
    effective_weekly_kg: plan.effective_weekly_kg,
    protein_g: macros.protein_g,
    carbs_g: macros.carbs_g,
    fat_g: macros.fat_g,
    water_ml,
    weight_target_kg: input.weightKg,
  };
}

export function ageFromBirthdate(birthdate: string): number {
  const birth = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return Math.max(age, 15);
}

export function sumMacros<
  T extends {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  },
>(items: T[]) {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + Number(item.calories || 0),
      protein_g: acc.protein_g + Number(item.protein_g || 0),
      carbs_g: acc.carbs_g + Number(item.carbs_g || 0),
      fat_g: acc.fat_g + Number(item.fat_g || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
}

export const ACTIVITY_OPTIONS = [
  { value: 1.2, label: "Sedentary (Little or No Exercise)" },
  { value: 1.375, label: "Lightly Active (1–3 Days/Week)" },
  { value: 1.55, label: "Moderately Active (3–5 Days/Week)" },
  { value: 1.725, label: "Very Active (6–7 Days/Week)" },
  { value: 1.9, label: "Athlete (Intense Daily Training)" },
] as const;
