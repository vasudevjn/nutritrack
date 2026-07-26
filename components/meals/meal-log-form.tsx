"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NutritionPreview } from "@/components/meals/nutrition-preview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { todayISO } from "@/lib/dates";
import type { MealType, ParsedMealItem } from "@/types/database";

export function MealLogForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [items, setItems] = useState<ParsedMealItem[] | null>(null);

  const parseMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/meals/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mealType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      return data as { items: ParsedMealItem[] };
    },
    onSuccess: (data) => {
      setItems(data.items);
      toast.success("Review the estimates, then save");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!items?.length) throw new Error("Nothing to save");
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_type: mealType,
          raw_input: text,
          logged_on: todayISO(),
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      return data;
    },
    onSuccess: () => {
      const date = todayISO();
      qc.invalidateQueries({ queryKey: ["meals", date] });
      toast.success("Meal saved");
      router.push("/dashboard");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="meal-text">What did you eat?</Label>
        <Textarea
          id="meal-text"
          rows={4}
          placeholder='e.g. "2 roti, 1 cup dal, 2 pieces chicken fry"'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Meal type</Label>
        <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        onClick={() => parseMutation.mutate()}
        disabled={text.trim().length < 2 || parseMutation.isPending}
      >
        {parseMutation.isPending ? "Estimating…" : "Estimate with AI"}
      </Button>

      {items && (
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-xl">Nutrition preview</h2>
            <p className="text-sm text-muted-foreground">
              Edit any values before saving to your day.
            </p>
          </div>
          <NutritionPreview items={items} onChange={setItems} />
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={!items.length || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "Saving…" : "Save meal"}
          </Button>
        </div>
      )}
    </div>
  );
}
