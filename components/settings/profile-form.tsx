"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { QueryError } from "@/components/ui/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Sex } from "@/types/database";

const SEX_ITEMS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

async function fetchProfile() {
  const res = await fetch("/api/profile");
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json() as Promise<{ profile: Profile | null }>;
}

export function ProfileForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState<number | "">("");
  const [birthdate, setBirthdate] = useState("");
  const [activity, setActivity] = useState(1.55);

  useEffect(() => {
    if (!data?.profile) return;
    setFullName(data.profile.full_name || "");
    setSex((data.profile.sex as Sex) || "male");
    setHeightCm(data.profile.height_cm ? Number(data.profile.height_cm) : "");
    setBirthdate(data.profile.birthdate || "");
    setActivity(Number(data.profile.activity_level || 1.55));
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          sex,
          height_cm: heightCm === "" ? null : heightCm,
          birthdate: birthdate || null,
          activity_level: activity,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (isError) {
    return <QueryError message="Could not load profile" onRetry={() => void refetch()} />;
  }

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />;

  return (
    <div className="max-w-lg space-y-6">
      <form
        className="space-y-4 rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={data?.profile?.email || ""} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name">Name</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            value={heightCm}
            onChange={(e) =>
              setHeightCm(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
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
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save Profile"}
        </Button>
      </form>

      <Button type="button" variant="outline" onClick={signOut}>
        Sign Out
      </Button>
    </div>
  );
}
