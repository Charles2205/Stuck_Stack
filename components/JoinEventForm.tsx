"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { postJson } from "@/lib/hooks/fetcher";
import { useSession } from "@/lib/hooks/useSession";
import type { AttendeeDTO } from "@/lib/types";

export function JoinEventForm({
  slug,
  allowOrganiserJoin = true,
}: {
  slug: string;
  allowOrganiserJoin?: boolean;
}) {
  const router = useRouter();
  const { attendee, mutate } = useSession();
  const [name, setName] = useState("");
  const [organiser, setOrganiser] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boardHref = `/event/${slug}`;
  const organiserHref = `/event/${slug}/organiser`;
  const attendeeJoinedThisEvent = attendee?.eventSlug === slug;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const joiningAsOrganiser = allowOrganiserJoin ? organiser : false;
    try {
      const { attendee: joined } = await postJson<{ attendee: AttendeeDTO }>(
        `/api/events/${slug}/join`,
        { name, organiser: joiningAsOrganiser },
      );
      await mutate({ attendee: joined }, { revalidate: false });
      router.push(joiningAsOrganiser ? organiserHref : boardHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join the event");
      setSubmitting(false);
    }
  }

  if (attendee && attendeeJoinedThisEvent) {
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
          allowOrganiserJoin={allowOrganiserJoin}
        />
      </div>
    );
  }

  if (attendee && !attendeeJoinedThisEvent) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-500">
          You are currently joined to another event as{" "}
          <strong>{attendee.name}</strong>. Join this event below to switch.
        </p>
        <RawJoinForm
          name={name}
          setName={setName}
          organiser={organiser}
          setOrganiser={setOrganiser}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          allowOrganiserJoin={allowOrganiserJoin}
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
      allowOrganiserJoin={allowOrganiserJoin}
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
  allowOrganiserJoin: boolean;
}) {
  return (
    <form onSubmit={props.onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Your name
        <Input
          value={props.name}
          onChange={(e) => props.setName(String(e.value ?? ""))}
          placeholder="Ada Lovelace"
          aria-label="Your name"
          maxLength={60}
        />
      </label>
      {props.allowOrganiserJoin && (
        <Checkbox
          checked={props.organiser}
          onChange={(e) => props.setOrganiser(Boolean(e.value))}
          label="I'm an organiser (opens the live dashboard)"
        />
      )}
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
