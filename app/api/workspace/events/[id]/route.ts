import { NextResponse } from "next/server";
import { handleApi, readJson } from "@/lib/api";
import { requireOrganizer } from "@/lib/organizerSession";
import { deleteEvent, updateEvent } from "@/lib/services/workspaceEvents";
import { updateEventSchema } from "@/lib/validation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;
    const organizer = await requireOrganizer();
    const input = updateEventSchema.parse(await readJson(req));
    const event = await updateEvent(organizer.id, id, input);
    return NextResponse.json({ event });
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;
    const organizer = await requireOrganizer();
    await deleteEvent(organizer.id, id);
    return NextResponse.json({ ok: true });
  });
}
