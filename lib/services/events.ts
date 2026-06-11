import type { Attendee, Event } from "@prisma/client";
import { ApiError } from "../api";
import { ROLE } from "../constants";
import { prisma } from "../db";
import type { JoinEventInput } from "../validation";

export async function getEventBySlug(slug: string): Promise<Event> {
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) throw new ApiError("NOT_FOUND", `No event with slug "${slug}"`);
  return event;
}

export async function joinEvent(
  slug: string,
  input: JoinEventInput,
): Promise<Attendee> {
  const event = await getEventBySlug(slug);
  return prisma.attendee.create({
    data: {
      eventId: event.id,
      name: input.name,
      role: input.organiser ? ROLE.ORGANISER : ROLE.ATTENDEE,
    },
  });
}
