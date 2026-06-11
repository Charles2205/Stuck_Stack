import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api";
import { offerHelp } from "@/lib/services/offers";
import { requireAttendee } from "@/lib/session";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;
    const attendee = await requireAttendee();
    const result = await offerHelp(id, attendee.id);
    return NextResponse.json(result, { status: 201 });
  });
}
