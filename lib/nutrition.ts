import type { Sex } from "@/types/database";

/** Mifflin–St Jeor BMR × activity multiplier; macros ~30/40/30 P/C/F */
export function suggestGoals(input: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: number;
}) {
  const { sex, weightKg, heightCm, age, activityLevel } = input;
  const s = sex === "male" ? 5 : sex === "female" ? -161 : -78;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
  const calories = Math.round(bmr * activityLevel);
  const protein_g = Math.round((calories * 0.3) / 4);
  const carbs_g = Math.round((calories * 0.4) / 4);
  const fat_g = Math.round((calories * 0.3) / 9);
  const water_ml = Math.round(weightKg * 35);

  return {
    calorie_target: calories,
    protein_g,
    carbs_g,
    fat_g,
    water_ml,
    weight_target_kg: weightKg,
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
  { value: 1.2, label: "Sedentary (little or no exercise)" },
  { value: 1.375, label: "Lightly active (1–3 days/week)" },
  { value: 1.55, label: "Moderately active (3–5 days/week)" },
  { value: 1.725, label: "Very active (6–7 days/week)" },
  { value: 1.9, label: "Athlete (intense daily training)" },
] as const;
