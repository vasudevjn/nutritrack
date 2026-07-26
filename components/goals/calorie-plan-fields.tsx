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
  WEEKLY_RATE_OPTIONS,
} from "@/lib/nutrition";
import type { CalorieGoalType } from "@/types/database";

export function CaloriePlanFields({
  goalType,
  weeklyKg,
  maintenance,
  dailyDelta,
  calorieTarget,
  onGoalTypeChange,
  onWeeklyKgChange,
  onCalorieTargetChange,
}: {
  goalType: CalorieGoalType;
  weeklyKg: number;
  maintenance: number;
  dailyDelta: number;
  calorieTarget: number;
  onGoalTypeChange: (type: CalorieGoalType) => void;
  onWeeklyKgChange: (kg: number) => void;
  onCalorieTargetChange: (calories: number) => void;
}) {
  const rateItems = WEEKLY_RATE_OPTIONS.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
  }));

  const typeVerb =
    goalType === "deficit" ? "lose" : goalType === "surplus" ? "gain" : "maintain";

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
            value={String(weeklyKg)}
            onValueChange={(v) => onWeeklyKgChange(Number(v) || 0.5)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Rate" />
            </SelectTrigger>
            <SelectContent>
              {WEEKLY_RATE_OPTIONS.map((opt) => (
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
            Plan to {typeVerb} {weeklyKg} kg/week (
            {dailyDelta} kcal/day {goalType === "deficit" ? "deficit" : "surplus"}
            ).
          </p>
        ) : (
          <p className="mt-1 text-muted-foreground">
            Eat near maintenance to hold your current weight.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="calorie_target">Daily Calories</Label>
        <Input
          id="calorie_target"
          type="number"
          value={calorieTarget}
          onChange={(e) => onCalorieTargetChange(Number(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">
          Auto-calculated from your plan. You can override this value.
        </p>
      </div>
    </div>
  );
}
