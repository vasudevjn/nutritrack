import { MealLogForm } from "@/components/meals/meal-log-form";

export default function LogPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-heading text-3xl tracking-tight">Log a Meal</h1>
        <p className="mt-1 text-muted-foreground">
          Describe your meal in plain language. Review estimates, then save.
        </p>
      </header>
      <MealLogForm />
    </div>
  );
}
