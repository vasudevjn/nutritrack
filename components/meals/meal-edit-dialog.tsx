"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NutritionPreview } from "@/components/meals/nutrition-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Meal, MealType, ParsedMealItem } from "@/types/database";

export function MealEditDialog({
  meal,
  date,
  open,
  onOpenChange,
}: {
  meal: Meal | null;
  date: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [items, setItems] = useState<ParsedMealItem[]>([]);

  useEffect(() => {
    if (!meal) return;
    setMealType(meal.meal_type);
    setItems(
      (meal.meal_items || []).map((i) => ({
        name: i.name,
        quantity: Number(i.quantity),
        unit: i.unit,
        calories: Number(i.calories),
        protein_g: Number(i.protein_g),
        carbs_g: Number(i.carbs_g),
        fat_g: Number(i.fat_g),
      })),
    );
  }, [meal]);

  const save = useMutation({
    mutationFn: async () => {
      if (!meal) throw new Error("No meal selected");
      const cleaned = items.filter((i) => i.name.trim());
      if (!cleaned.length) throw new Error("Add at least one named food item");

      const res = await fetch(`/api/meals/${meal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_type: mealType,
          name: cleaned
            .slice(0, 3)
            .map((i) => i.name)
            .join(", "),
          items: cleaned,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meals", date] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Meal updated");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit meal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Meal type</Label>
            <Select
              value={mealType}
              onValueChange={(v) => setMealType((v as MealType) || "lunch")}
            >
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
          <NutritionPreview items={items} onChange={setItems} />
          <Button
            type="button"
            disabled={save.isPending || !items.some((i) => i.name.trim())}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
