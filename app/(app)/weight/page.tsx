import { WeightView } from "@/components/weight/weight-view";

export default function WeightPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl tracking-tight">Weight</h1>
        <p className="mt-1 text-muted-foreground">Log weigh-ins and watch the trend.</p>
      </header>
      <WeightView />
    </div>
  );
}
