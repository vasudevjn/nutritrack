"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Meal } from "@/types/database";

export function MealCard({ meal, date }: { meal: Meal; date: string }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/meals/${meal.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meals", date] });
      toast.success("Meal deleted");
    },
    onError: () => toast.error("Could not delete meal"),
  });

  return (
    <div className="animate-row-in flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-4 py-3">
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{meal.name}</p>
          <Badge variant="secondary" className="capitalize">
            {meal.meal_type}
          </Badge>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">
          {meal.calories} kcal · P {Math.round(Number(meal.protein_g))}g · C{" "}
          {Math.round(Number(meal.carbs_g))}g · F {Math.round(Number(meal.fat_g))}g
        </p>
        {meal.meal_items && meal.meal_items.length > 0 && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {meal.meal_items.map((i) => i.name).join(" · ")}
          </p>
        )}
      </div>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Delete meal"
        disabled={del.isPending}
        onClick={() => del.mutate()}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
