import { Leaf } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-primary-foreground shadow-sm">
          <Leaf className="size-5" />
          <span className="font-heading text-2xl tracking-tight">NutriTrack</span>
        </div>
        <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-md text-muted-foreground">{subtitle}</p>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
