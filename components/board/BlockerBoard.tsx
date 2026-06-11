"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@progress/kendo-react-buttons";
import { BLOCKER_STATUS, SUGGESTED_TAGS, type BlockerStatus } from "@/lib/constants";
import { postJson } from "@/lib/hooks/fetcher";
import { useBlockers } from "@/lib/hooks/useBlockers";
import { useSession } from "@/lib/hooks/useSession";
import type { BlockerDTO } from "@/lib/types";
import { JoinEventForm } from "../JoinEventForm";
import { BlockerCard } from "./BlockerCard";
import { ClaimSlotDialog } from "./ClaimSlotDialog";
import { PostBlockerDialog } from "./PostBlockerDialog";
import { TagFilter } from "./TagFilter";

const SECTIONS: { status: BlockerStatus; heading: string }[] = [
  { status: BLOCKER_STATUS.OPEN, heading: "Open blockers" },
  { status: BLOCKER_STATUS.MATCHED, heading: "Matched — help on the way" },
  { status: BLOCKER_STATUS.SOLVED, heading: "Solved" },
];

export function BlockerBoard({
  slug,
  eventName,
}: {
  slug: string;
  eventName: string;
}) {
  const { attendee } = useSession();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<"stuck" | "recent">("stuck");
  const { blockers, mutate, isLoading } = useBlockers(slug, {
    tags: selectedTags,
    sort,
  });
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [claimBlockerId, setClaimBlockerId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const eventAttendee = attendee?.eventSlug === slug ? attendee : null;

  const availableTags = useMemo(() => {
    const tags = new Set<string>(SUGGESTED_TAGS);
    for (const blocker of blockers ?? []) {
      for (const tag of blocker.tags) tags.add(tag);
    }
    return [...tags].sort();
  }, [blockers]);

  const claimBlocker =
    blockers?.find((b) => b.id === claimBlockerId) ?? null;

  async function runAction(blockerId: string, action: () => Promise<unknown>) {
    setActionError(null);
    setBusyId(blockerId);
    try {
      await action();
      await mutate();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  const handleStuckToo = (b: BlockerDTO) =>
    runAction(b.id, () => postJson(`/api/blockers/${b.id}/stuck-too`));
  const handleOfferHelp = (b: BlockerDTO) =>
    runAction(b.id, () => postJson(`/api/blockers/${b.id}/offer-help`));
  const handleSolve = (b: BlockerDTO) =>
    runAction(b.id, () => postJson(`/api/blockers/${b.id}/solve`));

  return (
    <div className="flex flex-col gap-10 lg:gap-12">
      <header className="flex flex-col lg:flex-row items-stretch justify-between gap-8 mb-4 relative">
        <div className="brutal-box bg-[#00e676] p-6 lg:p-8 flex-1 shadow-[8px_8px_0px_0px_#111] border-[4px] border-[#111] z-10 -rotate-1">
          <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter drop-shadow-[3px_3px_0px_#fff]">{eventName}</h1>
          <p className="text-lg font-bold text-[#111] mt-4 bg-white p-2 border-2 border-[#111] shadow-[2px_2px_0px_0px_#111] w-fit">
            {eventAttendee ? (
              <>
                Signed in as <strong className="text-[#ff3d00] text-xl">{eventAttendee.name}</strong>
                {" · "}
                <Link href="/" className="underline decoration-2 underline-offset-4">
                  switch
                </Link>
                {eventAttendee.role === "ORGANISER" && (
                  <>
                    {" · "}
                    <Link
                      href={`/event/${slug}/organiser`}
                      className="underline decoration-2 underline-offset-4"
                    >
                      organiser dashboard
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                Join this event below to post blockers, mark stuck too, or offer
                help.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-4 justify-end min-w-[300px] z-10 rotate-1">
          <div className="brutal-box bg-white p-4 flex flex-col gap-3 border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111]">
            <TagFilter
              available={availableTags}
              selected={selectedTags}
              onChange={setSelectedTags}
            />
            <Button
              togglable
              selected={sort === "stuck"}
              onClick={() => setSort(sort === "stuck" ? "recent" : "stuck")}
              title="Toggle between most-stuck-first and newest-first"
            >
              {sort === "stuck" ? "Most stuck first" : "Newest first"}
            </Button>
            <Button
              themeColor="primary"
              disabled={!eventAttendee}
              onClick={() => setShowPostDialog(true)}
            >
              + I&apos;m stuck on…
            </Button>
          </div>
        </div>
      </header>

      {!eventAttendee && (
        <section
          id="join-event"
          className="grid grid-cols-1 gap-5 brutal-box bg-[#ffd200] p-5 lg:grid-cols-[1fr_minmax(280px,360px)]"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-[#111] uppercase drop-shadow-[2px_2px_0px_#fff]">
              Join {eventName}
            </h2>
            <p className="max-w-2xl text-base font-bold leading-6 text-[#111]">
              This event link is made for QR sharing. Join once, then post a
              blocker, add a stuck-too signal, or offer a quick help slot from
              the same board.
            </p>
          </div>
          <div className="lg:border-l-[3px] lg:border-[#111] lg:pl-5">
            <JoinEventForm slug={slug} allowOrganiserJoin={false} />
          </div>
        </section>
      )}

      {actionError && (
        <p className="brutal-box bg-[#ff3d00] text-[#111] font-bold text-sm px-3 py-2">
          {actionError}
        </p>
      )}

      {isLoading && !blockers && (
        <p className="text-slate-500">Loading the board…</p>
      )}

      {SECTIONS.map(({ status, heading }) => {
        const group = (blockers ?? []).filter((b) => b.status === status);
        if (group.length === 0) return null;
        return (
          <section key={status} className="flex flex-col gap-3">
            <h2 className="text-xl font-extrabold uppercase tracking-widest text-[#111] bg-[#00e5ff] w-full px-4 py-3 brutal-box border-b-8 mb-4 translate-x-[-10px]">
              {heading} ({group.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {group.map((blocker) => (
                <BlockerCard
                  key={blocker.id}
                  blocker={blocker}
                  viewer={eventAttendee}
                  busy={busyId === blocker.id}
                  onStuckToo={handleStuckToo}
                  onOfferHelp={handleOfferHelp}
                  onClaimSlot={(b) => setClaimBlockerId(b.id)}
                  onSolve={handleSolve}
                />
              ))}
            </div>
          </section>
        );
      })}

      {blockers && blockers.length === 0 && (
        <p className="text-slate-500">
          No blockers match. Be the first to post one!
        </p>
      )}

      {showPostDialog && (
        <PostBlockerDialog
          slug={slug}
          availableTags={availableTags}
          onClose={() => setShowPostDialog(false)}
          onCreated={() => mutate()}
        />
      )}
      {claimBlocker && (
        <ClaimSlotDialog
          blocker={claimBlocker}
          onClose={() => setClaimBlockerId(null)}
          onClaimed={() => mutate()}
        />
      )}
    </div>
  );
}
