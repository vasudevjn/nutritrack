"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { emptyItem, NutritionPreview } from "@/components/meals/nutrition-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function MealLogFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const initialDate = searchParams.get("date") || todayISO();

  const [text, setText] = useState("");
  const [loggedOn, setLoggedOn] = useState(initialDate);
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
    onError: (e: Error) => {
      toast.error(`${e.message}. You can enter nutrition manually.`);
      setItems((prev) =>
        prev?.length
          ? prev
          : [
              {
                name: text.trim() || "Meal item",
                quantity: 1,
                unit: "serving",
                calories: 0,
                protein_g: 0,
                carbs_g: 0,
                fat_g: 0,
              },
            ],
      );
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!items?.length) throw new Error("Nothing to save");
      const cleaned = items.filter((i) => i.name.trim());
      if (!cleaned.length) throw new Error("Add at least one named food item");

      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_type: mealType,
          raw_input: text || null,
          logged_on: loggedOn,
          items: cleaned,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meals", loggedOn] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Meal saved");
      router.push(loggedOn === todayISO() ? "/dashboard" : `/history?date=${loggedOn}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function startManual() {
    setItems([emptyItem()]);
    toast.message("Enter nutrition manually, then save");
  }

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Meal type</Label>
          <Select value={mealType} onValueChange={(v) => setMealType((v as MealType) || "lunch")}>
            <SelectTrigger className="w-full">
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
        <div className="space-y-2">
          <Label htmlFor="logged-on">Date</Label>
          <Input
            id="logged-on"
            type="date"
            value={loggedOn}
            max={todayISO()}
            onChange={(e) => setLoggedOn(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => parseMutation.mutate()}
          disabled={text.trim().length < 2 || parseMutation.isPending}
        >
          {parseMutation.isPending ? "Estimating…" : "Estimate with AI"}
        </Button>
        <Button type="button" variant="secondary" onClick={startManual}>
          Enter manually
        </Button>
      </div>

      {items && (
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-xl">Nutrition preview</h2>
            <p className="text-sm text-muted-foreground">
              Edit any values before saving.
            </p>
          </div>
          <NutritionPreview items={items} onChange={setItems} />
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={!items.some((i) => i.name.trim()) || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "Saving…" : "Save meal"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function MealLogForm() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <MealLogFormInner />
    </Suspense>
  );
}
