"use client";

// TODO(kendo-scheduler): replace the start-time picker with a Kendo Scheduler
// timeline of help-desk tables so helpers see existing slots and book gaps
// visually (docs/ARCHITECTURE.md §8).

import { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { Label } from "@progress/kendo-react-labels";
import { postJson } from "@/lib/hooks/fetcher";
import type { BlockerDTO } from "@/lib/types";
import { claimSlotSchema } from "@/lib/validation";

type Props = {
  blocker: BlockerDTO;
  onClose: () => void;
  onClaimed: () => void;
};

export function ClaimSlotDialog({ blocker, onClose, onClaimed }: Props) {
  const [location, setLocation] = useState("Help Desk — Table 1");
  const [startInMinutes, setStartInMinutes] = useState<number | null>(15);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    const parsed = claimSlotSchema.safeParse({
      location,
      startInMinutes: startInMinutes ?? undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    if (!blocker.viewerOffer) {
      setError("Offer to help first");
      return;
    }
    setSubmitting(true);
    try {
      await postJson<{ blocker: BlockerDTO }>(
        `/api/offers/${blocker.viewerOffer.id}/claim`,
        parsed.data,
      );
      onClaimed();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not claim the slot");
      setSubmitting(false);
    }
  }

  return (
    <Dialog title="Claim a 5-minute help slot" onClose={onClose} width={420}>
      <div className="flex flex-col gap-6 py-2">
        <p className="text-base font-bold text-[#111] bg-[#ffd200] p-3 border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111]">
          You&apos;re helping with: <strong className="font-black text-xl uppercase tracking-tighter block mt-1">{blocker.title}</strong>
        </p>
        <div className="flex flex-col gap-2">
          <Label className="text-xl font-black uppercase tracking-tighter text-[#111]">Where will you meet?</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(String(e.value ?? ""))}
            maxLength={100}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xl font-black uppercase tracking-tighter text-[#111]">Starting in (minutes from now)</Label>
          <NumericTextBox
            value={startInMinutes}
            onChange={(e) => setStartInMinutes(e.value)}
            min={0}
            max={480}
            step={5}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <DialogActionsBar>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button themeColor="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Claiming…" : "Claim slot"}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
