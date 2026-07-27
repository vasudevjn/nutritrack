"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CALORIE_GOAL_TYPE_ITEMS,
  DEFICIT_WEEKLY_RATE_OPTIONS,
  SURPLUS_WEEKLY_RATE_OPTIONS,
} from "@/lib/nutrition";
import type { CalorieGoalType } from "@/types/database";

export function CaloriePlanFields({
  goalType,
  weeklyKg,
  maintenance,
  dailyDelta,
  calorieTarget,
  minCalories,
  clamped,
  effectiveWeeklyKg,
  onGoalTypeChange,
  onWeeklyKgChange,
  onCalorieTargetChange,
}: {
  goalType: CalorieGoalType;
  weeklyKg: number;
  maintenance: number;
  dailyDelta: number;
  calorieTarget: number;
  minCalories: number;
  clamped: boolean;
  effectiveWeeklyKg: number;
  onGoalTypeChange: (type: CalorieGoalType) => void;
  onWeeklyKgChange: (kg: number) => void;
  onCalorieTargetChange: (calories: number) => void;
}) {
  const rateOptions =
    goalType === "deficit"
      ? DEFICIT_WEEKLY_RATE_OPTIONS
      : SURPLUS_WEEKLY_RATE_OPTIONS;

  const rateItems = rateOptions.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
  }));

  const typeVerb =
    goalType === "deficit" ? "lose" : goalType === "surplus" ? "gain" : "maintain";

  const selectedWeekly =
    rateOptions.some((opt) => opt.value === weeklyKg)
      ? weeklyKg
      : (rateOptions[1]?.value ?? 0.5);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Calorie Plan</Label>
        <Select
          items={[...CALORIE_GOAL_TYPE_ITEMS]}
          value={goalType}
          onValueChange={(v) =>
            onGoalTypeChange((v as CalorieGoalType) || "maintenance")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Plan" />
          </SelectTrigger>
          <SelectContent>
            {CALORIE_GOAL_TYPE_ITEMS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {goalType !== "maintenance" && (
        <div className="space-y-2">
          <Label>
            Weekly Weight to {goalType === "deficit" ? "Lose" : "Gain"}
          </Label>
          <Select
            items={rateItems}
            value={String(selectedWeekly)}
            onValueChange={(v) => onWeeklyKgChange(Number(v) || 0.5)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Rate" />
            </SelectTrigger>
            <SelectContent>
              {rateOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="rounded-xl border border-border/70 bg-secondary/50 px-4 py-3 text-sm">
        <p>
          Maintenance:{" "}
          <span className="font-medium tabular-nums">{maintenance} kcal/day</span>
        </p>
        {goalType !== "maintenance" ? (
          <p className="mt-1 text-muted-foreground">
            Plan to {typeVerb}{" "}
            {clamped ? effectiveWeeklyKg : weeklyKg} kg/week (
            {dailyDelta} kcal/day {goalType === "deficit" ? "deficit" : "surplus"}
            ).
          </p>
        ) : (
          <p className="mt-1 text-muted-foreground">
            Eat near maintenance to hold your current weight.
          </p>
        )}
        {goalType === "deficit" && (
          <p className="mt-1 text-muted-foreground">
            Safe floor: {minCalories} kcal/day (never below your estimated BMR or
            sex-based guidance).
          </p>
        )}
        {clamped && goalType === "deficit" && (
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            This rate would drop calories too low, so your target is held at{" "}
            {calorieTarget} kcal/day (~{effectiveWeeklyKg} kg/week). Pick a gentler
            rate or raise activity/intake later with a clinician if needed.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="calorie_target">Daily Calories</Label>
        <Input
          id="calorie_target"
          type="number"
          min={minCalories}
          value={calorieTarget}
          onChange={(e) => {
            const next = Number(e.target.value) || 0;
            onCalorieTargetChange(
              goalType === "deficit" ? Math.max(minCalories, next) : next,
            );
          }}
        />
        <p className="text-xs text-muted-foreground">
          Auto-calculated from your plan. Manual overrides stay at or above{" "}
          {minCalories} kcal/day for deficits.
        </p>
      </div>
    </div>
  );
}
