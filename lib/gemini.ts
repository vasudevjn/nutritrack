import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { sumMacros } from "@/lib/nutrition";
import type { ParsedMeal } from "@/types/database";

const itemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
});

const responseSchema = z.object({
  items: z.array(itemSchema).min(1),
});

export async function parseMealFromText(text: string): Promise<ParsedMeal> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const prompt = `You are a nutrition estimator for a diet tracking app used primarily in India.
Parse the user's meal description into individual food items with estimated nutrition.

Rules:
- Prefer Indian household portions (roti, dal, sabzi, rice, idli, dosa, chicken fry, etc.)
- Estimate calories and macros realistically for cooked/prepared food as described
- Use clear item names and sensible units (piece, cup, bowl, g, ml, tbsp)
- Return ONLY valid JSON matching this shape:
{"items":[{"name":"string","quantity":number,"unit":"string","calories":number,"protein_g":number,"carbs_g":number,"fat_g":number}]}
- calories/macros should be for the quantity given, not per 100g
- Round calories to whole numbers; macros to 1 decimal place

User meal: """${text.replace(/"/g, "'")}"""`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned invalid JSON. Try a clearer meal description.");
  }

  const validated = responseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error("Could not understand that meal. Try again with clearer items.");
  }

  const items = validated.data.items.map((item) => ({
    ...item,
    calories: Math.round(item.calories),
    protein_g: Math.round(item.protein_g * 10) / 10,
    carbs_g: Math.round(item.carbs_g * 10) / 10,
    fat_g: Math.round(item.fat_g * 10) / 10,
  }));

  return { items, totals: sumMacros(items) };
}
