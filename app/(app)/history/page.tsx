import { Suspense } from "react";
import { HistoryView } from "@/components/history/history-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
      <HistoryView />
    </Suspense>
  );
}
