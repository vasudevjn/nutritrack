"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVITY_OPTIONS, ageFromBirthdate, suggestGoals } from "@/lib/nutrition";
import type { Sex } from "@/types/database";

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

  const suggested = useMemo(
    () =>
      suggestGoals({
        sex,
        weightKg,
        heightCm,
        age: ageFromBirthdate(birthdate),
        activityLevel: activity,
      }),
    [sex, weightKg, heightCm, birthdate, activity],
  );

  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  const [proteinG, setProteinG] = useState<number | null>(null);
  const [carbsG, setCarbsG] = useState<number | null>(null);
  const [fatG, setFatG] = useState<number | null>(null);
  const [waterMl, setWaterMl] = useState<number | null>(null);
  const [weightTarget, setWeightTarget] = useState<number | null>(null);

  function goToGoals() {
    if (!fullName.trim()) {
      toast.error("Please enter your name");
      return;
    }
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
        calorie_target: calorieTarget ?? suggested.calorie_target,
        protein_g: proteinG ?? suggested.protein_g,
        carbs_g: carbsG ?? suggested.carbs_g,
        fat_g: fatG ?? suggested.fat_g,
        water_ml: waterMl ?? suggested.water_ml,
        weight_target_kg: weightTarget ?? suggested.weight_target_kg,
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
      title={step === 1 ? "Tell us about you" : "Confirm your goals"}
      subtitle={
        step === 1
          ? "We'll estimate calorie and macro targets you can edit anytime."
          : "Based on Mifflin–St Jeor. Adjust anything before continuing."
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
            <Select value={sex} onValueChange={(v) => setSex(v as Sex)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
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
            <Label>Activity level</Label>
            <Select
              value={String(activity)}
              onValueChange={(v) => setActivity(Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" className="w-full" onClick={goToGoals}>
            Continue
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Calories</Label>
              <Input
                type="number"
                value={calorieTarget ?? ""}
                onChange={(e) => setCalorieTarget(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Water (ml)</Label>
              <Input
                type="number"
                value={waterMl ?? ""}
                onChange={(e) => setWaterMl(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Protein (g)</Label>
              <Input
                type="number"
                value={proteinG ?? ""}
                onChange={(e) => setProteinG(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Carbs (g)</Label>
              <Input
                type="number"
                value={carbsG ?? ""}
                onChange={(e) => setCarbsG(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Fat (g)</Label>
              <Input
                type="number"
                value={fatG ?? ""}
                onChange={(e) => setFatG(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Weight goal (kg)</Label>
              <Input
                type="number"
                value={weightTarget ?? ""}
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
