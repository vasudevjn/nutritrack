"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CaloriePlanFields } from "@/components/goals/calorie-plan-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryError } from "@/components/ui/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ageFromBirthdate,
  applyCaloriePlan,
  macrosFromCalories,
  maintenanceCalories,
} from "@/lib/nutrition";
import type { CalorieGoalType, Goals, Profile, WeightLog } from "@/types/database";

async function fetchGoals() {
  const res = await fetch("/api/goals");
  if (!res.ok) throw new Error("Failed to load goals");
  return res.json() as Promise<{ goals: Goals | null }>;
}

async function fetchProfile() {
  const res = await fetch("/api/profile");
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json() as Promise<{ profile: Profile | null }>;
}

async function fetchWeight() {
  const res = await fetch("/api/weight");
  if (!res.ok) throw new Error("Failed to load weight");
  return res.json() as Promise<{ logs: WeightLog[] }>;
}

export function GoalsForm() {
  const qc = useQueryClient();
  const goalsQuery = useQuery({ queryKey: ["goals"], queryFn: fetchGoals });
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const weightQuery = useQuery({ queryKey: ["weight"], queryFn: fetchWeight });

  const [goalType, setGoalType] = useState<CalorieGoalType>("maintenance");
  const [weeklyKg, setWeeklyKg] = useState(0.5);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [proteinG, setProteinG] = useState(150);
  const [carbsG, setCarbsG] = useState(200);
  const [fatG, setFatG] = useState(65);
  const [waterMl, setWaterMl] = useState(2500);
  const [weightTarget, setWeightTarget] = useState<number | null>(70);
  const [manualCalories, setManualCalories] = useState(false);

  const currentWeight =
    weightQuery.data?.logs?.[0]?.weight_kg != null
      ? Number(weightQuery.data.logs[0].weight_kg)
      : Number(goalsQuery.data?.goals?.weight_target_kg || 70);

  const profile = profileQuery.data?.profile;

  const maintenance = useMemo(() => {
    if (!profile?.sex || !profile.height_cm || !profile.birthdate || !profile.activity_level) {
      return calorieTarget;
    }
    return maintenanceCalories({
      sex: profile.sex,
      weightKg: currentWeight,
      heightCm: Number(profile.height_cm),
      age: ageFromBirthdate(profile.birthdate),
      activityLevel: Number(profile.activity_level),
    });
  }, [profile, currentWeight, calorieTarget]);

  const plan = useMemo(
    () =>
      applyCaloriePlan({
        maintenance,
        goalType,
        weeklyWeightChangeKg: weeklyKg,
      }),
    [maintenance, goalType, weeklyKg],
  );

  useEffect(() => {
    const g = goalsQuery.data?.goals;
    if (!g) return;
    setGoalType(g.calorie_goal_type || "maintenance");
    setWeeklyKg(Number(g.weekly_weight_change_kg || 0.5) || 0.5);
    setCalorieTarget(g.calorie_target);
    setProteinG(g.protein_g);
    setCarbsG(g.carbs_g);
    setFatG(g.fat_g);
    setWaterMl(Number(g.water_ml));
    setWeightTarget(g.weight_target_kg ? Number(g.weight_target_kg) : null);
    setManualCalories(false);
  }, [goalsQuery.data]);

  useEffect(() => {
    if (manualCalories) return;
    setCalorieTarget(plan.calorie_target);
    const macros = macrosFromCalories(plan.calorie_target);
    setProteinG(macros.protein_g);
    setCarbsG(macros.carbs_g);
    setFatG(macros.fat_g);
  }, [plan.calorie_target, manualCalories]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calorie_goal_type: goalType,
          weekly_weight_change_kg: goalType === "maintenance" ? 0 : weeklyKg,
          calorie_target: calorieTarget,
          protein_g: proteinG,
          carbs_g: carbsG,
          fat_g: fatG,
          water_ml: waterMl,
          weight_target_kg: weightTarget,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goals updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const loading = goalsQuery.isLoading || profileQuery.isLoading || weightQuery.isLoading;
  const errored = goalsQuery.isError || profileQuery.isError || weightQuery.isError;

  if (errored) {
    return (
      <QueryError
        message="Could not load goals"
        onRetry={() => {
          void goalsQuery.refetch();
          void profileQuery.refetch();
          void weightQuery.refetch();
        }}
      />
    );
  }

  if (loading) return <Skeleton className="h-72 rounded-2xl" />;

  return (
    <form
      className="max-w-lg space-y-4 rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <CaloriePlanFields
        goalType={goalType}
        weeklyKg={weeklyKg}
        maintenance={plan.maintenance}
        dailyDelta={plan.daily_delta}
        calorieTarget={calorieTarget}
        onGoalTypeChange={(type) => {
          setManualCalories(false);
          setGoalType(type);
          if (type !== "maintenance" && weeklyKg <= 0) setWeeklyKg(0.5);
        }}
        onWeeklyKgChange={(kg) => {
          setManualCalories(false);
          setWeeklyKg(kg);
        }}
        onCalorieTargetChange={(calories) => {
          setManualCalories(true);
          setCalorieTarget(calories);
          const macros = macrosFromCalories(calories);
          setProteinG(macros.protein_g);
          setCarbsG(macros.carbs_g);
          setFatG(macros.fat_g);
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="protein_g">Protein (g)</Label>
          <Input
            id="protein_g"
            type="number"
            value={proteinG}
            onChange={(e) => setProteinG(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carbs_g">Carbs (g)</Label>
          <Input
            id="carbs_g"
            type="number"
            value={carbsG}
            onChange={(e) => setCarbsG(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fat_g">Fat (g)</Label>
          <Input
            id="fat_g"
            type="number"
            value={fatG}
            onChange={(e) => setFatG(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="water_ml">Water (ml)</Label>
          <Input
            id="water_ml"
            type="number"
            value={waterMl}
            onChange={(e) => setWaterMl(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="weight_target_kg">Weight Target (kg)</Label>
          <Input
            id="weight_target_kg"
            type="number"
            value={weightTarget ?? ""}
            onChange={(e) =>
              setWeightTarget(e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </div>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving…" : "Save Goals"}
      </Button>
    </form>
  );
}
