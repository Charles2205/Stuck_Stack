"use client";

import { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { Label } from "@progress/kendo-react-labels";
import { postJson } from "@/lib/hooks/fetcher";
import type { BlockerDTO } from "@/lib/types";
import { createBlockerSchema } from "@/lib/validation";

type Props = {
  slug: string;
  availableTags: string[];
  onClose: () => void;
  onCreated: () => void;
};

export function PostBlockerDialog({
  slug,
  availableTags,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    const parsed = createBlockerSchema.safeParse({ title, description, tags });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    setSubmitting(true);
    try {
      await postJson<{ blocker: BlockerDTO }>(
        `/api/events/${slug}/blockers`,
        parsed.data,
      );
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post blocker");
      setSubmitting(false);
    }
  }

  return (
    <Dialog title="What are you stuck on?" onClose={onClose} width={480}>
      <div className="flex flex-col gap-6 py-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xl font-black uppercase tracking-tighter text-[#111]">Title — be specific</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(String(e.value ?? ""))}
            placeholder='e.g. "My Docker container works locally but fails on deploy"'
            maxLength={120}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xl font-black uppercase tracking-tighter text-[#111]">What have you tried? What does failure look like?</Label>
          <TextArea
            value={description}
            onChange={(e) => setDescription(String(e.value ?? ""))}
            rows={4}
            maxLength={1000}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xl font-black uppercase tracking-tighter text-[#111]">Tags (pick or type your own)</Label>
          <MultiSelect
            data={availableTags}
            value={tags}
            onChange={(e) => setTags((e.value as string[]).slice(0, 5))}
            allowCustom
            placeholder="AI/LLMs, DevOps, …"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <DialogActionsBar>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button themeColor="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Posting…" : "Post blocker"}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
