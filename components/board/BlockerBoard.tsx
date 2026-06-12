"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@progress/kendo-react-buttons";
import { SUGGESTED_TAGS } from "@/lib/constants";
import { postJson } from "@/lib/hooks/fetcher";
import { useBlockers } from "@/lib/hooks/useBlockers";
import { useBoardNotifications } from "@/lib/hooks/useBoardNotifications";
import { useSession } from "@/lib/hooks/useSession";
import type { BlockerDTO } from "@/lib/types";
import { JoinEventForm } from "../JoinEventForm";
import { BlockerTaskBoard } from "./BlockerTaskBoard";
import { BoardToastHost } from "./BoardToastHost";
import { ClaimSlotDialog } from "./ClaimSlotDialog";
import { PostBlockerDialog } from "./PostBlockerDialog";
import { TagFilter } from "./TagFilter";

export function BlockerBoard({
  slug,
  eventName,
  eventOwner = null,
}: {
  slug: string;
  eventName: string;
  eventOwner?: { name: string } | null;
}) {
  const { attendee } = useSession();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<"stuck" | "recent">("stuck");
  const { blockers: allBlockers, mutate, isLoading } = useBlockers(slug, { sort });
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [claimBlockerId, setClaimBlockerId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const eventAttendee =
    !eventOwner && attendee?.eventSlug === slug ? attendee : null;

  const blockers = useMemo(() => {
    if (!allBlockers) return undefined;
    if (selectedTags.length === 0) return allBlockers;
    return allBlockers.filter((b) =>
      selectedTags.every((tag) => b.tags.includes(tag)),
    );
  }, [allBlockers, selectedTags]);

  const { toasts, dismissToast, syncBaseline } = useBoardNotifications(
    allBlockers,
    {
      enabled: eventAttendee !== null,
      viewerName: eventAttendee?.name ?? null,
    },
  );

  const availableTags = useMemo(() => {
    const tags = new Set<string>(SUGGESTED_TAGS);
    for (const blocker of allBlockers ?? []) {
      for (const tag of blocker.tags) tags.add(tag);
    }
    return [...tags].sort();
  }, [allBlockers]);

  const claimBlocker =
    blockers?.find((b) => b.id === claimBlockerId) ?? null;

  async function runAction(blockerId: string, action: () => Promise<unknown>) {
    setActionError(null);
    setBusyId(blockerId);
    try {
      await action();
      const updated = await mutate();
      if (updated?.blockers) syncBaseline(updated.blockers);
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
      <BoardToastHost toasts={toasts} onDismiss={dismissToast} />
      <header className="flex flex-col lg:flex-row items-stretch justify-between gap-8 mb-4 relative">
        <div className="brutal-box bg-[#00e676] p-6 lg:p-8 flex-1 shadow-[8px_8px_0px_0px_#111] border-[4px] border-[#111] z-10 -rotate-1">
          <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter drop-shadow-[3px_3px_0px_#fff]">{eventName}</h1>
          <p className="text-lg font-bold text-[#111] mt-4 bg-white p-2 border-2 border-[#111] shadow-[2px_2px_0px_0px_#111] w-fit">
            {eventOwner ? (
              <>
                Managing as{" "}
                <strong className="text-[#ff3d00] text-xl">{eventOwner.name}</strong>
                {" · "}
                <Link
                  href={`/event/${slug}/organiser`}
                  className="underline decoration-2 underline-offset-4"
                >
                  Live dashboard
                </Link>
                {" · "}
                <Link href="/workspace" className="underline decoration-2 underline-offset-4">
                  Workspace
                </Link>
              </>
            ) : eventAttendee ? (
              <>
                Signed in as <strong className="text-[#ff3d00] text-xl">{eventAttendee.name}</strong>
                {" · "}
                <Link href="/" className="underline decoration-2 underline-offset-4">
                  switch
                </Link>
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
            {!eventOwner && (
              <Button
                themeColor="primary"
                disabled={!eventAttendee}
                onClick={() => setShowPostDialog(true)}
              >
                + I&apos;m stuck on…
              </Button>
            )}
          </div>
        </div>
      </header>

      {eventOwner && (
        <section className="grid grid-cols-1 gap-5 brutal-box bg-[#ffd200] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-[#111] uppercase drop-shadow-[2px_2px_0px_#fff]">
              Attendee preview
            </h2>
            <p className="max-w-2xl text-base font-bold leading-6 text-[#111]">
              This is the public board your attendees see after scanning the QR
              code. Manage blockers, clinics, and sharing from your live
              dashboard — you don&apos;t join your own event as an attendee.
            </p>
          </div>
          <Link
            href={`/event/${slug}/organiser`}
            className="inline-flex w-fit min-h-10 items-center brutal-box bg-[#ff3d00] px-5 py-2 text-base font-black uppercase tracking-wider text-white hover:bg-[#111] transition-colors border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111]"
          >
            Open live dashboard
          </Link>
        </section>
      )}

      {!eventOwner && !eventAttendee && (
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
            <JoinEventForm slug={slug} />
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

      {blockers && blockers.length > 0 && (
        <BlockerTaskBoard
          blockers={blockers}
          personalView={eventAttendee !== null}
          sort={sort}
          viewer={eventAttendee}
          busyId={busyId}
          onStuckToo={handleStuckToo}
          onOfferHelp={handleOfferHelp}
          onClaimSlot={(b) => setClaimBlockerId(b.id)}
          onSolve={handleSolve}
        />
      )}

      {blockers && blockers.length === 0 && (
        <p className="text-slate-500">
          {eventOwner
            ? "No blockers yet — attendees will post here once they join."
            : "No blockers match. Be the first to post one!"}
        </p>
      )}

      {showPostDialog && (
        <PostBlockerDialog
          slug={slug}
          availableTags={availableTags}
          onClose={() => setShowPostDialog(false)}
          onCreated={async () => {
            const updated = await mutate();
            if (updated?.blockers) syncBaseline(updated.blockers);
          }}
        />
      )}
      {claimBlocker && (
        <ClaimSlotDialog
          blocker={claimBlocker}
          onClose={() => setClaimBlockerId(null)}
          onClaimed={async () => {
            const updated = await mutate();
            if (updated?.blockers) syncBaseline(updated.blockers);
          }}
        />
      )}
    </div>
  );
}
