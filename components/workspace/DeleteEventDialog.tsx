"use client";

import { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { deleteJson } from "@/lib/hooks/fetcher";
import type { WorkspaceEventDTO } from "@/lib/types";

type Props = {
  event: WorkspaceEventDTO;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteEventDialog({ event, onClose, onDeleted }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setSubmitting(true);
    try {
      await deleteJson(`/api/workspace/events/${event.id}`);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the event");
      setSubmitting(false);
    }
  }

  return (
    <Dialog title="Delete event?" onClose={onClose} width={420}>
      <div className="flex flex-col gap-4 py-4">
        <p className="text-xl font-bold text-[#111]">
          Delete <strong className="bg-[#ff3d00] text-white px-2 py-0.5 border-2 border-[#111] shadow-[2px_2px_0px_0px_#111]">{event.name}</strong> permanently?
        </p>
        <p className="text-base font-bold bg-[#ffd200] border-[3px] border-[#111] text-[#111] p-3 shadow-[4px_4px_0px_0px_#111]">
          This also deletes its {event.counts.blockers} blocker
          {event.counts.blockers === 1 ? "" : "s"}, {event.counts.attendees}{" "}
          attendee{event.counts.attendees === 1 ? "" : "s"}, and all stuck-too
          signals, help offers, and slots. <br/><span className="text-[#ff3d00] font-black uppercase mt-1 inline-block bg-[#111] px-1">There is no undo.</span>
        </p>
        {error && <p className="text-base font-bold text-white bg-[#ff3d00] border-[3px] border-[#111] p-2 shadow-[2px_2px_0px_0px_#111]">{error}</p>}
      </div>
      <DialogActionsBar>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button themeColor="error" onClick={handleDelete} disabled={submitting}>
          {submitting ? "Deleting…" : "Delete event"}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
