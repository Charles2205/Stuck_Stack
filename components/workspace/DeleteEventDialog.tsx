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
      <div className="flex flex-col gap-3 py-2">
        <p className="text-slate-700">
          Delete <strong>{event.name}</strong> permanently?
        </p>
        <p className="text-sm rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2">
          This also deletes its {event.counts.blockers} blocker
          {event.counts.blockers === 1 ? "" : "s"}, {event.counts.attendees}{" "}
          attendee{event.counts.attendees === 1 ? "" : "s"}, and all stuck-too
          signals, help offers, and slots. There is no undo.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
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
