"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Droplets } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

async function fetchWater(date: string) {
  const res = await fetch(`/api/water?date=${date}`);
  if (!res.ok) throw new Error("Failed to load water");
  return res.json() as Promise<{ total_ml: number }>;
}

export function WaterTracker({
  date,
  targetMl,
}: {
  date: string;
  targetMl: number;
}) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["water", date],
    queryFn: () => fetchWater(date),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_ml: 250, logged_on: date }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add water");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["water", date] });
      toast.success("+250 ml water");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const total = data?.total_ml ?? 0;
  const pct = targetMl > 0 ? Math.min((total / targetMl) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border border-border/80 bg-card/70 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="size-4 text-primary" />
          <h3 className="font-medium">Water</h3>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {total} / {targetMl} ml
        </span>
      </div>
      <Progress value={pct} className="mb-3 h-2.5" />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        + Add 250 ml
      </Button>
    </div>
  );
}
