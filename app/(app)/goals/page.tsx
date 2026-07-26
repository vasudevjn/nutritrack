import { GoalsForm } from "@/components/goals/goals-form";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl tracking-tight">Goals</h1>
        <p className="mt-1 text-muted-foreground">
          Choose maintenance, deficit, or surplus — then set how many kg per week.
        </p>
      </header>
      <GoalsForm />
    </div>
  );
}
