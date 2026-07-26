"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { MealList } from "@/components/meals/meal-list";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryError } from "@/components/ui/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDisplayDate, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Meal } from "@/types/database";

async function fetchMeals(date: string) {
  const res = await fetch(`/api/meals?date=${date}`);
  if (!res.ok) throw new Error("Failed to load meals");
  return res.json() as Promise<{
    meals: Meal[];
    totals: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
  }>;
}

export function HistoryView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || todayISO();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["meals", date],
    queryFn: () => fetchMeals(date),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">History</h1>
          <p className="mt-1 text-muted-foreground">{formatDisplayDate(date)}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="history-date">Date</Label>
            <Input
              id="history-date"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => router.push(`/history?date=${e.target.value}`)}
              className="w-44"
            />
          </div>
          <Link
            href={`/log?date=${date}`}
            className={cn(buttonVariants(), "inline-flex gap-1.5")}
          >
            <Plus className="size-4" />
            Log for day
          </Link>
        </div>
      </header>

      {isError ? (
        <QueryError message="Could not load this day's meals" onRetry={() => void refetch()} />
      ) : isLoading || !data ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : (
        <>
          <div className="rounded-2xl border border-border/80 bg-card/70 px-4 py-3 text-sm tabular-nums backdrop-blur-sm">
            <span className="font-medium">{data.totals.calories} kcal</span>
            <span className="text-muted-foreground">
              {" "}
              · P {Math.round(data.totals.protein_g)}g · C{" "}
              {Math.round(data.totals.carbs_g)}g · F {Math.round(data.totals.fat_g)}g
            </span>
          </div>
          <MealList meals={data.meals} date={date} />
        </>
      )}
    </div>
  );
}
