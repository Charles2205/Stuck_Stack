import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api";
import { getDashboard } from "@/lib/services/dashboard";
import { getEventBySlug } from "@/lib/services/events";
import { getSessionAttendee } from "@/lib/session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleApi(async () => {
    const { slug } = await params;
    const [event, viewer] = await Promise.all([
      getEventBySlug(slug),
      getSessionAttendee(),
    ]);
    const dashboard = await getDashboard(event.id, viewer?.id ?? null);
    return NextResponse.json({
      event: { name: event.name, slug: event.slug },
      ...dashboard,
    });
  });
}
