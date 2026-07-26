"use client";

import { MealCard } from "@/components/meals/meal-card";
import type { Meal } from "@/types/database";

export function MealList({ meals, date }: { meals: Meal[]; date: string }) {
  if (!meals.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        No meals logged yet. Describe what you ate on the Log page.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {meals.map((meal, i) => (
        <div key={meal.id} style={{ animationDelay: `${i * 40}ms` }}>
          <MealCard meal={meal} date={date} />
        </div>
      ))}
    </div>
  );
}
