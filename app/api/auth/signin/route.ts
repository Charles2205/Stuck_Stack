import { NextResponse } from "next/server";
import { handleApi, readJson } from "@/lib/api";
import { signIn } from "@/lib/services/organizers";
import { setOrganizerCookie } from "@/lib/organizerSession";
import { organizerAuthSchema } from "@/lib/validation";

export async function POST(req: Request) {
  return handleApi(async () => {
    const { name } = organizerAuthSchema.parse(await readJson(req));
    const organizer = await signIn(name);
    await setOrganizerCookie(organizer.id);
    return NextResponse.json({
      organizer: { id: organizer.id, name: organizer.name },
    });
  });
}
