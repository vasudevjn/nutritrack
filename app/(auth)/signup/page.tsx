import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignupPage() {
  return (
    <AuthShell
      title="Start tracking"
      subtitle="Sign up with your email — no password. We'll email a one-tap sign-in link."
    >
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
        <MagicLinkForm mode="signup" />
      </Suspense>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
