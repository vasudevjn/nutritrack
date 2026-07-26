"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { QueryError, QuerySkeletons } from "@/components/ui/query-state";
import type { AnalyticsDay, Goals } from "@/types/database";

async function fetchAnalytics(range: "7d" | "30d") {
  const res = await fetch(`/api/analytics?range=${range}`);
  if (!res.ok) throw new Error("Failed to load analytics");
  return res.json() as Promise<{ days: AnalyticsDay[]; goals: Goals | null }>;
}

function ChartCard({
  title,
  children,
  empty,
}: {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/70 p-4 backdrop-blur-sm">
      <h2 className="mb-3 font-heading text-lg">{title}</h2>
      <div className="h-56">
        {empty ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            No data yet for this range
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function AnalyticsView() {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analytics", range],
    queryFn: () => fetchAnalytics(range),
  });

  const days =
    data?.days.map((d) => ({
      ...d,
      label: d.date.slice(5),
      protein: Math.round(d.protein_g),
    })) || [];

  const hasCalories = days.some((d) => d.calories > 0);
  const hasProtein = days.some((d) => d.protein > 0);
  const weightDays = days.filter((d) => d.weight_kg != null);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Calorie, protein, and weight trends
            {data?.goals?.weight_target_kg
              ? ` · target ${data.goals.weight_target_kg} kg`
              : ""}
            .
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={range === "7d" ? "default" : "secondary"}
            onClick={() => setRange("7d")}
          >
            7 days
          </Button>
          <Button
            type="button"
            size="sm"
            variant={range === "30d" ? "default" : "secondary"}
            onClick={() => setRange("30d")}
          >
            30 days
          </Button>
        </div>
      </header>

      {isError ? (
        <QueryError message="Could not load analytics" onRetry={() => void refetch()} />
      ) : isLoading || !data ? (
        <QuerySkeletons />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Calories" empty={!hasCalories}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Bar dataKey="calories" fill="oklch(0.55 0.14 150)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Protein (g)" empty={!hasProtein}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Bar dataKey="protein" fill="oklch(0.62 0.12 85)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="lg:col-span-2">
            <ChartCard title="Weight (kg)" empty={weightDays.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightDays}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} width={40} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight_kg"
                    stroke="oklch(0.48 0.12 150)"
                    strokeWidth={2}
                    name="Weight"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
