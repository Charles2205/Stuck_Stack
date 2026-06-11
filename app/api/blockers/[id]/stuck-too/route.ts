import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api";
import { toggleStuckToo } from "@/lib/services/blockers";
import { requireAttendee } from "@/lib/session";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;
    const attendee = await requireAttendee();
    const result = await toggleStuckToo(id, attendee.id);
    return NextResponse.json(result);
  });
}
