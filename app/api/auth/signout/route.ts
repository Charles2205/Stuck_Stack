import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api";
import { clearOrganizerCookie } from "@/lib/organizerSession";

export async function POST() {
  return handleApi(async () => {
    await clearOrganizerCookie();
    return NextResponse.json({ ok: true });
  });
}
