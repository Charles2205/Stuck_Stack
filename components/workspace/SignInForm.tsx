"use client";

import { FetchError, postJson } from "@/lib/hooks/fetcher";
import type { OrganizerDTO } from "@/lib/types";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const trimmedName = name.trim();
  const canContinue = trimmedName.length >= 2 && !submitting;

  if (phase === "offer-signup") {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-lg font-bold text-[#111]">
          No organizer named{" "}
          <strong className="bg-[#00e5ff] px-2 py-0.5 border-2 border-[#111] shadow-[2px_2px_0px_0px_#111] mx-1">
            {name.trim()}
          </strong>{" "}
          yet. Create the account?
        </p>
        {error && (
          <p className="text-base font-bold text-white bg-[#ff3d00] border-[3px] border-[#111] p-2 shadow-[2px_2px_0px_0px_#111]">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-4">
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
    <form onSubmit={handleSignIn} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-xl font-black uppercase tracking-tighter text-[#111]">
        Your organizer name
        <Input
          value={name}
          onChange={(e) => setName(String(e.value ?? ""))}
          onInput={(e) => setName(e.currentTarget.value)}
          placeholder="Ada Lovelace"
          aria-label="Organizer name"
          autoComplete="name"
          maxLength={60}
        />
      </label>
      <p className="text-sm font-bold text-[#111] bg-[#ffd200] border-[3px] border-[#111] p-2 shadow-[2px_2px_0px_0px_#111]">
        At least 2 characters. Names are unique (case-insensitive). New name?
        We&apos;ll offer to create it.
      </p>
      {trimmedName.length === 1 && (
        <p className="text-sm font-bold text-[#111]">
          One more character to continue.
        </p>
      )}
      {error && (
        <p className="text-base font-bold text-white bg-[#ff3d00] border-[3px] border-[#111] p-2 shadow-[2px_2px_0px_0px_#111]">
          {error}
        </p>
      )}
      <Button
        type="submit"
        themeColor="primary"
        size="large"
        disabled={!canContinue}
      >
        {submitting ? "Signing in…" : "Continue"}
      </Button>
    </form>
  );
}
