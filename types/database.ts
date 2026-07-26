export type Sex = "male" | "female" | "other";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  sex: Sex | null;
  height_cm: number | null;
  birthdate: string | null;
  activity_level: number | null;
  onboarding_complete: boolean;
  created_at: string;
}

export interface Goals {
  user_id: string;
  calorie_target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
  weight_target_kg: number | null;
  updated_at: string;
}

export interface MealItem {
  id: string;
  meal_id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  meal_type: MealType;
  raw_input: string | null;
  logged_on: string;
  logged_at: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_items?: MealItem[];
}

export interface WaterLog {
  id: string;
  user_id: string;
  logged_on: string;
  amount_ml: number;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  logged_on: string;
  weight_kg: number;
  note: string | null;
  created_at: string;
}

export interface ParsedMealItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface ParsedMeal {
  items: ParsedMealItem[];
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

export interface DayTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
}

export interface AnalyticsDay {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  weight_kg: number | null;
}
