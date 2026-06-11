import { NextResponse } from "next/server";
import { handleApi, readJson } from "@/lib/api";
import type { Role } from "@/lib/constants";
import { joinEvent } from "@/lib/services/events";
import { setAttendeeCookie } from "@/lib/session";
import { joinEventSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleApi(async () => {
    const { slug } = await params;
    const input = joinEventSchema.parse(await readJson(req));
    const attendee = await joinEvent(slug, input);
    await setAttendeeCookie(attendee.id);
    return NextResponse.json(
      {
        attendee: {
          id: attendee.id,
          name: attendee.name,
          role: attendee.role as Role,
          eventSlug: slug,
        },
      },
      { status: 201 },
    );
  });
}
