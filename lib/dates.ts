import { format, subDays } from "date-fns";

export function todayISO(date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return format(new Date(y, m - 1, d), "EEEE, MMM d");
}

export function dateRangeISO(range: "7d" | "30d"): string[] {
  const days = range === "7d" ? 7 : 30;
  const end = new Date();
  return Array.from({ length: days }, (_, i) =>
    format(subDays(end, days - 1 - i), "yyyy-MM-dd"),
  );
}
