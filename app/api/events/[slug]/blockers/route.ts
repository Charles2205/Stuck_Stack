import { NextResponse } from "next/server";
import { handleApi, readJson } from "@/lib/api";
import { createBlocker, listBlockers } from "@/lib/services/blockers";
import { getEventBySlug } from "@/lib/services/events";
import { getSessionAttendee, requireAttendee } from "@/lib/session";
import { createBlockerSchema, listBlockersQuerySchema } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleApi(async () => {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const query = listBlockersQuerySchema.parse({
      tags: searchParams.get("tags") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });

    const [event, viewer] = await Promise.all([
      getEventBySlug(slug),
      getSessionAttendee(),
    ]);
    const blockers = await listBlockers(event.id, viewer?.id ?? null, query);
    return NextResponse.json({ blockers });
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleApi(async () => {
    const { slug } = await params;
    const input = createBlockerSchema.parse(await readJson(req));
    const [event, attendee] = await Promise.all([
      getEventBySlug(slug),
      requireAttendee(),
    ]);
    const blocker = await createBlocker(event.id, attendee.id, input);
    return NextResponse.json({ blocker }, { status: 201 });
  });
}
