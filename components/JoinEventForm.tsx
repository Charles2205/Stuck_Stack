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
  const attendeeJoinedThisEvent = attendee?.eventSlug === slug;

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
    <div className="flex flex-col gap-4 mt-2">
      {attendee && attendeeJoinedThisEvent && (
        <div className="flex flex-col gap-4">
          <p className="text-xl text-[#111] font-bold">
            You&apos;re in as <strong className="text-2xl font-black bg-[#00e5ff] px-2 border-2 border-[#111] shadow-[2px_2px_0px_0px_#111]">{attendee.name}</strong>.
          </p>
          <Button themeColor="primary" onClick={() => router.push(boardHref)} className="w-full" style={{ width: "100%" }}>
            Open the blocker board
          </Button>
          <p className="text-base font-bold text-[#111] bg-[#ffd200] p-2 border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111] w-fit mt-2">
            Not you? Join again below with a different name.
          </p>
        </div>
      )}
      {attendee && !attendeeJoinedThisEvent && (
        <p className="text-lg font-bold text-[#111] bg-[#ff3d00] text-white p-3 border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111]">
          You are currently joined to another event as{" "}
          <strong className="bg-[#111] text-[#ffd200] px-2 py-1">{attendee.name}</strong>. Join this event below to switch.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
        <label className="flex flex-col gap-2 text-xl font-black uppercase tracking-tighter text-[#111]">
          Your name
          <Input
            value={name}
            onChange={(e) => setName(String(e.value ?? ""))}
            placeholder="Ada Lovelace"
            aria-label="Your name"
            maxLength={60}
          />
        </label>
        {error && (
          <p className="text-base font-bold bg-[#ff3d00] text-white border-[3px] border-[#111] p-2 shadow-[2px_2px_0px_0px_#111]">
            {error}
          </p>
        )}
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
