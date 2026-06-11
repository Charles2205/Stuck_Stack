import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api";
import type { Role } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getSessionAttendee } from "@/lib/session";

export async function GET() {
  return handleApi(async () => {
    const attendee = await getSessionAttendee();
    if (!attendee) return NextResponse.json({ attendee: null });

    const event = await prisma.event.findUniqueOrThrow({
      where: { id: attendee.eventId },
      select: { slug: true },
    });
    return NextResponse.json({
      attendee: {
        id: attendee.id,
        name: attendee.name,
        role: attendee.role as Role,
        eventSlug: event.slug,
      },
    });
  });
}
