import { GoalsForm } from "@/components/goals/goals-form";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl tracking-tight">Goals</h1>
        <p className="mt-1 text-muted-foreground">
          Update calorie, macro, water, and weight targets.
        </p>
      </header>
      <GoalsForm />
    </div>
  );
}
