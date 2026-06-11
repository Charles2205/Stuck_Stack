import { NextResponse } from "next/server";
import { handleApi, readJson } from "@/lib/api";
import { requireOrganizer } from "@/lib/organizerSession";
import {
  createEvent,
  listEventsForOrganizer,
} from "@/lib/services/workspaceEvents";
import { createEventSchema } from "@/lib/validation";

export async function GET() {
  return handleApi(async () => {
    const organizer = await requireOrganizer();
    const events = await listEventsForOrganizer(organizer.id);
    return NextResponse.json({ events });
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const organizer = await requireOrganizer();
    const input = createEventSchema.parse(await readJson(req));
    const event = await createEvent(organizer.id, input);
    return NextResponse.json({ event }, { status: 201 });
  });
}
