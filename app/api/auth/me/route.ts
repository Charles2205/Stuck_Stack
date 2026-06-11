import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api";
import { getCurrentOrganizer } from "@/lib/organizerSession";

export async function GET() {
  return handleApi(async () => {
    const organizer = await getCurrentOrganizer();
    return NextResponse.json({
      organizer: organizer ? { id: organizer.id, name: organizer.name } : null,
    });
  });
}
