"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@progress/kendo-react-buttons";
import { BLOCKER_STATUS, SUGGESTED_TAGS, type BlockerStatus } from "@/lib/constants";
import { postJson } from "@/lib/hooks/fetcher";
import { useBlockers } from "@/lib/hooks/useBlockers";
import { useSession } from "@/lib/hooks/useSession";
import type { BlockerDTO } from "@/lib/types";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{eventName}</h1>
          <p className="text-sm text-slate-500">
            {attendee ? (
              <>
                Signed in as <strong>{attendee.name}</strong>
                {" · "}
                <Link href="/" className="underline">
                  switch
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="underline">
                  Join the event
                </Link>{" "}
                to post and interact.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
            disabled={!attendee}
            onClick={() => setShowPostDialog(true)}
          >
            + I&apos;m stuck on…
          </Button>
        </div>
      </header>

      {actionError && (
        <p className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {heading} ({group.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {group.map((blocker) => (
                <BlockerCard
                  key={blocker.id}
                  blocker={blocker}
                  viewer={attendee}
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
