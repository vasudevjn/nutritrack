import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Enter your email and we'll send a sign-in link. Stay signed in until you sign out."
    >
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
        <MagicLinkForm mode="signin" />
      </Suspense>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
