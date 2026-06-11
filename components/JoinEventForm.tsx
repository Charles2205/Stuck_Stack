"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { postJson } from "@/lib/hooks/fetcher";
import { useSession } from "@/lib/hooks/useSession";
import type { AttendeeDTO } from "@/lib/types";

export function JoinEventForm({ slug }: { slug: string }) {
  const router = useRouter();
  const { attendee, mutate } = useSession();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boardHref = `/event/${slug}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { attendee: joined } = await postJson<{ attendee: AttendeeDTO }>(
        `/api/events/${slug}/join`,
        { name },
      );
      await mutate({ attendee: joined }, { revalidate: false });
      router.push(boardHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join the event");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {attendee && (
        <div className="flex flex-col gap-3">
          <p className="text-slate-600">
            You&apos;re in as <strong>{attendee.name}</strong>.
          </p>
          <Button themeColor="primary" onClick={() => router.push(boardHref)}>
            Open the blocker board
          </Button>
          <p className="text-sm text-slate-500">
            Not you? Join again below with a different name.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          value={name}
          onChange={(e) => setName(String(e.value ?? ""))}
          placeholder="Your name"
          aria-label="Your name"
          maxLength={60}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          themeColor="primary"
          size="large"
          disabled={submitting || name.trim().length === 0}
        >
          {submitting ? "Joining…" : "Join the event"}
        </Button>
      </form>
    </div>
  );
}
