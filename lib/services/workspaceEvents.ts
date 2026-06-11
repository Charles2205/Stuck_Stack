import type { Event } from "@prisma/client";
import { ApiError } from "../api";
import { BLOCKER_STATUS } from "../constants";
import { prisma } from "../db";
import type { WorkspaceEventDTO } from "../types";
import type { CreateEventInput, UpdateEventInput } from "../validation";

function toWorkspaceEventDTO(
  event: Event & {
    blockers: { status: string }[];
    _count: { attendees: number };
  },
): WorkspaceEventDTO {
  const count = (status: string) =>
    event.blockers.filter((b) => b.status === status).length;
  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    date: event.date.toISOString(),
    createdAt: event.createdAt.toISOString(),
    counts: {
      blockers: event.blockers.length,
      open: count(BLOCKER_STATUS.OPEN),
      matched: count(BLOCKER_STATUS.MATCHED),
      solved: count(BLOCKER_STATUS.SOLVED),
      attendees: event._count.attendees,
    },
  };
}

const workspaceInclude = {
  blockers: { select: { status: true } },
  _count: { select: { attendees: true } },
} as const;

export async function listEventsForOrganizer(
  organizerId: string,
): Promise<WorkspaceEventDTO[]> {
  const events = await prisma.event.findMany({
    where: { organizerId },
    include: workspaceInclude,
    orderBy: { date: "asc" },
  });
  return events.map(toWorkspaceEventDTO);
}

export async function createEvent(
  organizerId: string,
  input: CreateEventInput,
): Promise<WorkspaceEventDTO> {
  const slugTaken = await prisma.event.findUnique({
    where: { slug: input.slug },
  });
  if (slugTaken) {
    throw new ApiError("CONFLICT", `The slug "${input.slug}" is already taken`);
  }
  const event = await prisma.event.create({
    data: {
      organizerId,
      name: input.name,
      slug: input.slug,
      date: input.date,
    },
    include: workspaceInclude,
  });
  return toWorkspaceEventDTO(event);
}

/** Loads an event only if the session organizer owns it (404 otherwise — we
 * don't reveal whether the event exists to non-owners). */
async function requireOwnedEvent(organizerId: string, eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.organizerId !== organizerId) {
    throw new ApiError("NOT_FOUND", "Event not found");
  }
  return event;
}

export async function updateEvent(
  organizerId: string,
  eventId: string,
  input: UpdateEventInput,
): Promise<WorkspaceEventDTO> {
  await requireOwnedEvent(organizerId, eventId);
  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.date !== undefined ? { date: input.date } : {}),
    },
    include: workspaceInclude,
  });
  return toWorkspaceEventDTO(event);
}

export async function deleteEvent(
  organizerId: string,
  eventId: string,
): Promise<void> {
  await requireOwnedEvent(organizerId, eventId);
  // Cascades to attendees, blockers, stuck-toos, offers, slots
  // (rationale: docs/ARCHITECTURE.md §10).
  await prisma.event.delete({ where: { id: eventId } });
}
