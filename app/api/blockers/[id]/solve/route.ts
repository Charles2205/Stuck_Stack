import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api";
import { solveBlocker } from "@/lib/services/blockers";
import { requireAttendee } from "@/lib/session";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;
    const attendee = await requireAttendee();
    const blocker = await solveBlocker(id, attendee);
    return NextResponse.json({ blocker });
  });
}
