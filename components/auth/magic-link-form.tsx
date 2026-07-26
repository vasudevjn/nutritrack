"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "sent";

export function MagicLinkForm({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "missing_env") {
      toast.error(
        "Supabase env vars missing. Add them to .env.local and restart the dev server.",
      );
    } else if (err === "auth") {
      toast.error("Could not complete sign-in. Request a new email and try again.");
    }
  }, [searchParams]);

  async function sendMagicLink(showSent = true) {
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (showSent) setStep("sent");
      toast.success(
        mode === "signup"
          ? "Check your email for a sign-up link"
          : "Check your email for a sign-in link",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setLoading(false);
    }
  }

  if (step === "sent") {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl border border-border/80 bg-secondary/50 px-4 py-5 text-sm">
          <p className="font-medium text-foreground">Check your inbox</p>
          <p className="mt-2 text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">{email}</span>. Open it
            on this device to continue. You&apos;ll stay signed in until you sign
            out.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:justify-between">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setStep("email")}
          >
            Use a different email
          </button>
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            disabled={loading}
            onClick={() => void sendMagicLink(false)}
          >
            {loading ? "Sending…" : "Resend link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void sendMagicLink(true);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
        {loading ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
