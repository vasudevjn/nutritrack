import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { parseMealFromText } from "@/lib/gemini";
import { parseMealSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const { errorResponse, user } = await requireUser();
  if (errorResponse || !user) return errorResponse!;

  const body = await request.json();
  const parsed = parseMealSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid input");
  }

  try {
    const meal = await parseMealFromText(parsed.data.text);
    return NextResponse.json(meal);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse meal";
    const status = message.includes("API_KEY") ? 503 : 422;
    return jsonError(message, status);
  }
}
