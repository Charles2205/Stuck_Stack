"use client";

import { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";
import { Label } from "@progress/kendo-react-labels";
import { patchJson, postJson } from "@/lib/hooks/fetcher";
import type { WorkspaceEventDTO } from "@/lib/types";
import { createEventSchema, updateEventSchema } from "@/lib/validation";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type Props = {
  event?: WorkspaceEventDTO; // present = edit mode
  onClose: () => void;
  onSaved: () => void;
};

export function EventFormDialog({ event, onClose, onSaved }: Props) {
  const isEdit = event !== undefined;
  const [name, setName] = useState(event?.name ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [date, setDate] = useState<Date | null>(
    event ? new Date(event.date) : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit() {
    setError(null);
    const payload = isEdit
      ? updateEventSchema.safeParse({ name, date: date ?? undefined })
      : createEventSchema.safeParse({ name, slug, date });
    if (!payload.success) {
      setError(payload.error.issues[0]?.message ?? "Check your input");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await patchJson(`/api/workspace/events/${event.id}`, {
          name,
          date: date?.toISOString(),
        });
      } else {
        await postJson("/api/workspace/events", {
          name,
          slug,
          date: date?.toISOString(),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the event");
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      title={isEdit ? `Edit "${event.name}"` : "Create an event"}
      onClose={onClose}
      width={440}
    >
      <div className="flex flex-col gap-5 py-4">
        <label className="flex flex-col gap-2 text-xl font-black uppercase tracking-tighter text-[#111]">
          Event name
          <Input
            value={name}
            onChange={(e) => handleNameChange(String(e.value ?? ""))}
            placeholder="GitNation Conf 2027"
            maxLength={80}
          />
        </label>
        {!isEdit && (
          <label className="flex flex-col gap-2 text-xl font-black uppercase tracking-tighter text-[#111]">
            Slug <span className="text-sm tracking-normal bg-[#ffd200] px-1 w-fit border-[2px] border-[#111]">in the URL: /event/&lt;slug&gt;</span>
            <Input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(String(e.value ?? ""));
              }}
              placeholder="gitnation-2027"
              maxLength={60}
            />
          </label>
        )}
        <label className="flex flex-col gap-2 text-xl font-black uppercase tracking-tighter text-[#111]">
          Date
          <DatePicker value={date} onChange={(e) => setDate(e.value)} />
        </label>
        {error && <p className="text-base font-bold text-white bg-[#ff3d00] border-[3px] border-[#111] p-2 shadow-[2px_2px_0px_0px_#111]">{error}</p>}
      </div>
      <DialogActionsBar>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button themeColor="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
