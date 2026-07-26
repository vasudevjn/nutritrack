import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().email(),
});

const caloriePlanFields = {
  calorie_goal_type: z.enum(["maintenance", "deficit", "surplus"]),
  weekly_weight_change_kg: z.coerce.number().min(0).max(1.5),
};

export const onboardingSchema = z.object({
  full_name: z.string().min(1),
  sex: z.enum(["male", "female", "other"]),
  height_cm: z.coerce.number().min(100).max(250),
  weight_kg: z.coerce.number().min(30).max(300),
  birthdate: z.string().min(1),
  activity_level: z.coerce.number().min(1.2).max(1.9),
  calorie_target: z.coerce.number().min(800).max(6000),
  protein_g: z.coerce.number().min(20).max(400),
  carbs_g: z.coerce.number().min(20).max(800),
  fat_g: z.coerce.number().min(10).max(400),
  water_ml: z.coerce.number().min(500).max(10000),
  weight_target_kg: z.coerce.number().min(30).max(300).optional().nullable(),
  ...caloriePlanFields,
});

export const goalsSchema = z.object({
  calorie_target: z.coerce.number().min(800).max(6000),
  protein_g: z.coerce.number().min(20).max(400),
  carbs_g: z.coerce.number().min(20).max(800),
  fat_g: z.coerce.number().min(10).max(400),
  water_ml: z.coerce.number().min(500).max(10000),
  weight_target_kg: z.coerce.number().min(30).max(300).optional().nullable(),
  ...caloriePlanFields,
});

export const profileSchema = z.object({
  full_name: z.string().min(1),
  sex: z.enum(["male", "female", "other"]).optional().nullable(),
  height_cm: z.coerce.number().min(100).max(250).optional().nullable(),
  birthdate: z.string().optional().nullable(),
  activity_level: z.coerce.number().min(1.2).max(1.9).optional().nullable(),
});

export const mealItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().min(0),
  unit: z.string().min(1),
  calories: z.coerce.number().min(0),
  protein_g: z.coerce.number().min(0),
  carbs_g: z.coerce.number().min(0),
  fat_g: z.coerce.number().min(0),
});

export const createMealSchema = z.object({
  name: z.string().min(1).optional(),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  raw_input: z.string().optional().nullable(),
  logged_on: z.string().optional(),
  items: z.array(mealItemSchema).min(1),
});

export const parseMealSchema = z.object({
  text: z.string().min(2, "Describe what you ate"),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
});

export const waterSchema = z.object({
  amount_ml: z.coerce.number().min(50).max(2000).optional(),
  logged_on: z.string().optional(),
});

export const weightSchema = z.object({
  weight_kg: z.coerce.number().min(30).max(300),
  logged_on: z.string().optional(),
  note: z.string().optional().nullable(),
});
