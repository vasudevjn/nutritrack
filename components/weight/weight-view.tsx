"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { todayISO } from "@/lib/dates";
import type { WeightLog } from "@/types/database";

async function fetchWeight() {
  const res = await fetch("/api/weight");
  if (!res.ok) throw new Error("Failed to load weight");
  return res.json() as Promise<{ logs: WeightLog[] }>;
}

export function WeightView() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["weight"], queryFn: fetchWeight });
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");

  const add = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_kg: Number(weight),
          note: note || null,
          logged_on: todayISO(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weight"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      setWeight("");
      setNote("");
      toast.success("Weight logged");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/weight?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weight"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Entry deleted");
    },
  });

  const chartData = [...(data?.logs || [])]
    .reverse()
    .map((log) => ({
      date: log.logged_on.slice(5),
      weight: Number(log.weight_kg),
    }));

  return (
    <div className="space-y-6">
      <form
        className="grid max-w-lg gap-3 rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            required
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={add.isPending} className="w-full">
            {add.isPending ? "Saving…" : "Log"}
          </Button>
        </div>
      </form>

      {isLoading ? (
        <Skeleton className="h-56 rounded-2xl" />
      ) : (
        <>
          {chartData.length > 1 && (
            <div className="h-56 rounded-2xl border border-border/80 bg-card/70 p-4 backdrop-blur-sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} width={40} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="oklch(0.48 0.12 150)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-2">
            {(data?.logs || []).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-card/60 px-4 py-3"
              >
                <div>
                  <p className="font-medium tabular-nums">{Number(log.weight_kg)} kg</p>
                  <p className="text-xs text-muted-foreground">
                    {log.logged_on}
                    {log.note ? ` · ${log.note}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => del.mutate(log.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {!data?.logs?.length && (
              <p className="text-sm text-muted-foreground">No weight entries yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
