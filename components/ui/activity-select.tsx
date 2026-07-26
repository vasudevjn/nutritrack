"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVITY_OPTIONS } from "@/lib/nutrition";

const ACTIVITY_ITEMS = ACTIVITY_OPTIONS.map((opt) => ({
  value: String(opt.value),
  label: opt.label,
}));

export function ActivitySelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const selected = ACTIVITY_ITEMS.find((opt) => opt.value === String(value));
  const selectValue = selected?.value ?? ACTIVITY_ITEMS[2].value;

  return (
    <Select
      items={ACTIVITY_ITEMS}
      value={selectValue}
      onValueChange={(v) => {
        if (v == null) return;
        onChange(Number(v));
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Activity Level" />
      </SelectTrigger>
      <SelectContent>
        {ACTIVITY_ITEMS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
