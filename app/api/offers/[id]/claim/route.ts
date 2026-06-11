import { NextResponse } from "next/server";
import { handleApi, readJson } from "@/lib/api";
import { claimSlot } from "@/lib/services/offers";
import { requireAttendee } from "@/lib/session";
import { claimSlotSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;
    const input = claimSlotSchema.parse(await readJson(req));
    const attendee = await requireAttendee();
    const blocker = await claimSlot(id, attendee.id, input);
    return NextResponse.json({ blocker });
  });
}
