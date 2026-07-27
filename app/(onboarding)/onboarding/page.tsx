"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { CaloriePlanFields } from "@/components/goals/calorie-plan-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActivitySelect } from "@/components/ui/activity-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ageFromBirthdate, macrosFromCalories, suggestGoals } from "@/lib/nutrition";
import type { CalorieGoalType, Sex } from "@/types/database";

const SEX_ITEMS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [birthdate, setBirthdate] = useState("1998-01-01");
  const [activity, setActivity] = useState(1.55);

  const [goalType, setGoalType] = useState<CalorieGoalType>("deficit");
  const [weeklyKg, setWeeklyKg] = useState(0.5);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [proteinG, setProteinG] = useState(150);
  const [carbsG, setCarbsG] = useState(200);
  const [fatG, setFatG] = useState(65);
  const [waterMl, setWaterMl] = useState(2500);
  const [weightTarget, setWeightTarget] = useState(70);
  const [manualCalories, setManualCalories] = useState(false);

  const suggested = useMemo(
    () =>
      suggestGoals({
        sex,
        weightKg,
        heightCm,
        age: ageFromBirthdate(birthdate),
        activityLevel: activity,
        goalType,
        weeklyWeightChangeKg: weeklyKg,
      }),
    [sex, weightKg, heightCm, birthdate, activity, goalType, weeklyKg],
  );

  useEffect(() => {
    if (step !== 2 || manualCalories) return;
    setCalorieTarget(suggested.calorie_target);
    setProteinG(suggested.protein_g);
    setCarbsG(suggested.carbs_g);
    setFatG(suggested.fat_g);
  }, [suggested, step, manualCalories]);

  function goToGoals() {
    if (!fullName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setManualCalories(false);
    setCalorieTarget(suggested.calorie_target);
    setProteinG(suggested.protein_g);
    setCarbsG(suggested.carbs_g);
    setFatG(suggested.fat_g);
    setWaterMl(suggested.water_ml);
    setWeightTarget(suggested.weight_target_kg);
    setStep(2);
  }

  async function finish() {
    setLoading(true);
    const res = await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        onboarding: true,
        full_name: fullName,
        sex,
        height_cm: heightCm,
        weight_kg: weightKg,
        birthdate,
        activity_level: activity,
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
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Could not save onboarding");
      return;
    }

    toast.success("You're all set");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title={step === 1 ? "Tell Us About You" : "Set Your Calorie Plan"}
      subtitle={
        step === 1
          ? "We'll estimate calorie and macro targets you can edit anytime."
          : "Choose maintenance, a deficit, or a surplus based on weekly kg change."
      }
    >
      {step === 1 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Sex</Label>
            <Select
              items={[...SEX_ITEMS]}
              value={sex}
              onValueChange={(v) => setSex((v as Sex) || "male")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Sex" />
              </SelectTrigger>
              <SelectContent>
                {SEX_ITEMS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthdate">Birthdate</Label>
            <Input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Activity Level</Label>
            <ActivitySelect value={activity} onChange={setActivity} />
          </div>
          <Button type="button" className="w-full" onClick={goToGoals}>
            Continue
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <CaloriePlanFields
            goalType={goalType}
            weeklyKg={weeklyKg}
            maintenance={suggested.maintenance_calories}
            dailyDelta={suggested.daily_calorie_delta}
            calorieTarget={calorieTarget}
            minCalories={suggested.min_calories}
            clamped={suggested.clamped}
            effectiveWeeklyKg={suggested.effective_weekly_kg}
            onGoalTypeChange={(type) => {
              setManualCalories(false);
              setGoalType(type);
              if (type === "deficit" && weeklyKg > 0.75) setWeeklyKg(0.5);
              else if (type !== "maintenance" && weeklyKg <= 0) setWeeklyKg(0.5);
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
              <Label>Protein (g)</Label>
              <Input
                type="number"
                value={proteinG}
                onChange={(e) => setProteinG(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Carbs (g)</Label>
              <Input
                type="number"
                value={carbsG}
                onChange={(e) => setCarbsG(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Fat (g)</Label>
              <Input
                type="number"
                value={fatG}
                onChange={(e) => setFatG(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Water (ml)</Label>
              <Input
                type="number"
                value={waterMl}
                onChange={(e) => setWaterMl(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Weight Target (kg)</Label>
              <Input
                type="number"
                value={weightTarget}
                onChange={(e) => setWeightTarget(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" className="flex-1" disabled={loading} onClick={finish}>
              {loading ? "Saving…" : "Finish"}
            </Button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
