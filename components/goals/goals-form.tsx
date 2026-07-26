"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryError } from "@/components/ui/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Goals } from "@/types/database";

async function fetchGoals() {
  const res = await fetch("/api/goals");
  if (!res.ok) throw new Error("Failed to load goals");
  return res.json() as Promise<{ goals: Goals | null }>;
}

export function GoalsForm() {
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
  });
  const [form, setForm] = useState({
    calorie_target: 2000,
    protein_g: 150,
    carbs_g: 200,
    fat_g: 65,
    water_ml: 2500,
    weight_target_kg: 70 as number | null,
  });

  useEffect(() => {
    if (data?.goals) {
      setForm({
        calorie_target: data.goals.calorie_target,
        protein_g: data.goals.protein_g,
        carbs_g: data.goals.carbs_g,
        fat_g: data.goals.fat_g,
        water_ml: Number(data.goals.water_ml),
        weight_target_kg: data.goals.weight_target_kg
          ? Number(data.goals.weight_target_kg)
          : null,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  if (isError) {
    return <QueryError message="Could not load goals" onRetry={() => void refetch()} />;
  }

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />;

  return (
    <form
      className="max-w-lg space-y-4 rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      {(
        [
          ["calorie_target", "Daily calories"],
          ["protein_g", "Protein (g)"],
          ["carbs_g", "Carbs (g)"],
          ["fat_g", "Fat (g)"],
          ["water_ml", "Water (ml)"],
          ["weight_target_kg", "Weight target (kg)"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            type="number"
            value={form[key] ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [key]: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
        </div>
      ))}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving…" : "Save goals"}
      </Button>
    </form>
  );
}
