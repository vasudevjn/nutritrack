"use client";

function Bar({
  label,
  current,
  target,
  color,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {Math.round(current)}g / {target}g
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full animate-bar-grow rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function MacroBars({
  protein,
  carbs,
  fat,
  targets,
}: {
  protein: number;
  carbs: number;
  fat: number;
  targets: { protein_g: number; carbs_g: number; fat_g: number };
}) {
  return (
    <div className="space-y-4">
      <Bar label="Protein" current={protein} target={targets.protein_g} color="oklch(0.55 0.14 150)" />
      <Bar label="Carbs" current={carbs} target={targets.carbs_g} color="oklch(0.62 0.12 85)" />
      <Bar label="Fat" current={fat} target={targets.fat_g} color="oklch(0.58 0.1 45)" />
    </div>
  );
}
