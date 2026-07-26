"use client";

export function CalorieRing({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  const size = 180;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(current / target, 1) : 0;
  const offset = circumference * (1 - pct);
  const remaining = Math.max(target - current, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={
              {
                "--ring-circumference": circumference,
                "--ring-offset": offset,
                strokeDashoffset: offset,
              } as React.CSSProperties
            }
            className="animate-ring-fill"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-heading text-3xl tabular-nums tracking-tight">
            {Math.round(current)}
          </span>
          <span className="text-xs text-muted-foreground">of {target} kcal</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {remaining > 0 ? `${remaining} kcal left today` : "Goal reached"}
      </p>
    </div>
  );
}
