"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sumMacros } from "@/lib/nutrition";
import type { ParsedMealItem } from "@/types/database";

const emptyItem = (): ParsedMealItem => ({
  name: "",
  quantity: 1,
  unit: "serving",
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
});

export function NutritionPreview({
  items,
  onChange,
}: {
  items: ParsedMealItem[];
  onChange: (items: ParsedMealItem[]) => void;
}) {
  const totals = sumMacros(items);

  function update(index: number, field: keyof ParsedMealItem, value: string) {
    const next = items.map((item, i) => {
      if (i !== index) return item;
      if (field === "name" || field === "unit") {
        return { ...item, [field]: value };
      }
      return { ...item, [field]: Number(value) || 0 };
    });
    onChange(next);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card/70">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Food</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Unit</th>
              <th className="px-3 py-2 font-medium">kcal</th>
              <th className="px-3 py-2 font-medium">P</th>
              <th className="px-3 py-2 font-medium">C</th>
              <th className="px-3 py-2 font-medium">F</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={`item-${index}`}
                className="animate-row-in border-b border-border/60 last:border-0"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-2 py-2">
                  <Input
                    value={item.name}
                    placeholder="Food name"
                    onChange={(e) => update(index, "name", e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="w-20 px-2 py-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => update(index, "quantity", e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="w-24 px-2 py-2">
                  <Input
                    value={item.unit}
                    onChange={(e) => update(index, "unit", e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="w-20 px-2 py-2">
                  <Input
                    type="number"
                    value={item.calories}
                    onChange={(e) => update(index, "calories", e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="w-20 px-2 py-2">
                  <Input
                    type="number"
                    value={item.protein_g}
                    onChange={(e) => update(index, "protein_g", e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="w-20 px-2 py-2">
                  <Input
                    type="number"
                    value={item.carbs_g}
                    onChange={(e) => update(index, "carbs_g", e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="w-20 px-2 py-2">
                  <Input
                    type="number"
                    value={item.fat_g}
                    onChange={(e) => update(index, "fat_g", e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="px-2 py-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(index)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange([...items, emptyItem()])}
        >
          <Plus className="size-4" />
          Add item
        </Button>
        <div className="rounded-xl bg-secondary/70 px-4 py-2 text-sm tabular-nums">
          <span className="font-medium">Totals:</span> {totals.calories} kcal · Protein{" "}
          {Math.round(totals.protein_g)}g · Carbs {Math.round(totals.carbs_g)}g · Fat{" "}
          {Math.round(totals.fat_g)}g
        </div>
      </div>
    </div>
  );
}

export { emptyItem };
