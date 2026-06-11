"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { FetchError, postJson } from "@/lib/hooks/fetcher";
import type { OrganizerDTO } from "@/lib/types";

type Phase = "input" | "offer-signup";

export function SignInForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSuccess() {
    // refresh so server components see the new session cookie
    router.push("/workspace");
    router.refresh();
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await postJson<{ organizer: OrganizerDTO }>("/api/auth/signin", { name });
      onSuccess();
    } catch (err) {
      if (err instanceof FetchError && err.code === "NOT_FOUND") {
        // unknown name → offer one-click sign-up instead of failing
        setPhase("offer-signup");
      } else {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      }
      setSubmitting(false);
    }
  }

  async function handleSignUp() {
    setError(null);
    setSubmitting(true);
    try {
      await postJson<{ organizer: OrganizerDTO }>("/api/auth/signup", { name });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed");
      setSubmitting(false);
      setPhase("input");
    }
  }

  if (phase === "offer-signup") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-slate-700">
          No organizer named <strong>{name.trim()}</strong> yet. Create the
          account?
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button
            themeColor="primary"
            disabled={submitting}
            onClick={handleSignUp}
          >
            {submitting ? "Creating…" : `Create "${name.trim()}"`}
          </Button>
          <Button
            disabled={submitting}
            onClick={() => {
              setPhase("input");
              setError(null);
            }}
          >
            Use a different name
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignIn} className="flex flex-col gap-3">
      <Input
        value={name}
        onChange={(e) => setName(String(e.value ?? ""))}
        placeholder="Your organizer name"
        aria-label="Organizer name"
        maxLength={60}
      />
      <p className="text-xs text-slate-500">
        Names are unique (case-insensitive). New name? We&apos;ll offer to
        create it.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        themeColor="primary"
        size="large"
        disabled={submitting || name.trim().length < 2}
      >
        {submitting ? "Signing in…" : "Continue"}
      </Button>
    </form>
  );
}
