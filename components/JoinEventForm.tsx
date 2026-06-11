"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { postJson } from "@/lib/hooks/fetcher";
import { useSession } from "@/lib/hooks/useSession";
import type { AttendeeDTO } from "@/lib/types";

export function JoinEventForm({ slug }: { slug: string }) {
  const router = useRouter();
  const { attendee, mutate } = useSession();
  const [name, setName] = useState("");
  const [organiser, setOrganiser] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boardHref = `/event/${slug}`;
  const organiserHref = `/event/${slug}/organiser`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { attendee: joined } = await postJson<{ attendee: AttendeeDTO }>(
        `/api/events/${slug}/join`,
        { name, organiser },
      );
      await mutate({ attendee: joined }, { revalidate: false });
      router.push(organiser ? organiserHref : boardHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join the event");
      setSubmitting(false);
    }
  }

  if (attendee) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-slate-600">
          You&apos;re in as <strong>{attendee.name}</strong>
          {attendee.role === "ORGANISER" ? " (organiser)" : ""}.
        </p>
        <div className="flex gap-2">
          <Button themeColor="primary" onClick={() => router.push(boardHref)}>
            Open the blocker board
          </Button>
          {attendee.role === "ORGANISER" && (
            <Button onClick={() => router.push(organiserHref)}>
              Organiser dashboard
            </Button>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Not you? Join again below with a different name.
        </p>
        <RawJoinForm
          name={name}
          setName={setName}
          organiser={organiser}
          setOrganiser={setOrganiser}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  return (
    <RawJoinForm
      name={name}
      setName={setName}
      organiser={organiser}
      setOrganiser={setOrganiser}
      submitting={submitting}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}

function RawJoinForm(props: {
  name: string;
  setName: (v: string) => void;
  organiser: boolean;
  setOrganiser: (v: boolean) => void;
  submitting: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="flex flex-col gap-3">
      <Input
        value={props.name}
        onChange={(e) => props.setName(String(e.value ?? ""))}
        placeholder="Your name"
        aria-label="Your name"
        maxLength={60}
      />
      <Checkbox
        checked={props.organiser}
        onChange={(e) => props.setOrganiser(Boolean(e.value))}
        label="I'm an organiser (opens the live dashboard)"
      />
      {props.error && <p className="text-sm text-red-600">{props.error}</p>}
      <Button
        type="submit"
        themeColor="primary"
        size="large"
        disabled={props.submitting || props.name.trim().length === 0}
      >
        {props.submitting ? "Joining…" : "Join the event"}
      </Button>
    </form>
  );
}
