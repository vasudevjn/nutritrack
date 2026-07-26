"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { MacroBars } from "@/components/dashboard/macro-bars";
import { WaterTracker } from "@/components/dashboard/water-tracker";
import { MealList } from "@/components/meals/meal-list";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDisplayDate, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Goals, Meal } from "@/types/database";

async function fetchMeals(date: string) {
  const res = await fetch(`/api/meals?date=${date}`);
  if (!res.ok) throw new Error("Failed to load meals");
  return res.json() as Promise<{
    meals: Meal[];
    totals: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
  }>;
}

async function fetchGoals() {
  const res = await fetch("/api/goals");
  if (!res.ok) throw new Error("Failed to load goals");
  return res.json() as Promise<{ goals: Goals | null }>;
}

export function DashboardView() {
  const date = todayISO();
  const mealsQuery = useQuery({ queryKey: ["meals", date], queryFn: () => fetchMeals(date) });
  const goalsQuery = useQuery({ queryKey: ["goals"], queryFn: fetchGoals });

  const goals = goalsQuery.data?.goals;
  const totals = mealsQuery.data?.totals;
  const loading = mealsQuery.isLoading || goalsQuery.isLoading;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{formatDisplayDate(date)}</p>
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">Today</h1>
        </div>
        <Link href="/log" className={cn(buttonVariants(), "inline-flex gap-1.5")}>
          <Plus className="size-4" />
          Log meal
        </Link>
      </header>

      {loading || !goals || !totals ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div className="rounded-2xl border border-border/80 bg-card/70 p-6 backdrop-blur-sm">
              <CalorieRing current={totals.calories} target={goals.calorie_target} />
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm">
                <h2 className="mb-4 font-heading text-xl">Macros</h2>
                <MacroBars
                  protein={totals.protein_g}
                  carbs={totals.carbs_g}
                  fat={totals.fat_g}
                  targets={goals}
                />
              </div>
              <WaterTracker date={date} targetMl={Number(goals.water_ml)} />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl">Meals</h2>
              <Link href="/history" className="text-sm text-primary hover:underline">
                History
              </Link>
            </div>
            <MealList meals={mealsQuery.data?.meals || []} date={date} />
          </section>
        </>
      )}
    </div>
  );
}
