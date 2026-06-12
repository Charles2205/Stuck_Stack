import type { Prisma } from "@prisma/client";
import { ApiError } from "../api";
import {
  BLOCKER_STATUS,
  OFFER_STATUS,
  ROLE,
  type BlockerStatus,
  type OfferStatus,
} from "../constants";
import { prisma } from "../db";
import type { BlockerDTO } from "../types";
import type { CreateBlockerInput } from "../validation";

/** Everything needed to build a BlockerDTO in one query. */
export const blockerInclude = {
  author: { select: { id: true, name: true } },
  tags: { select: { name: true } },
  stuckToos: { select: { attendeeId: true } },
  helpOffers: {
    include: {
      helper: { select: { id: true, name: true } },
      helpSlot: true,
    },
  },
} satisfies Prisma.BlockerInclude;

export type BlockerWithRelations = Prisma.BlockerGetPayload<{
  include: typeof blockerInclude;
}>;

export function toBlockerDTO(
  blocker: BlockerWithRelations,
  viewerId: string | null,
): BlockerDTO {
  const viewerOffer =
    (viewerId &&
      blocker.helpOffers.find((offer) => offer.helperId === viewerId)) ||
    null;
  const claimedOffer = blocker.helpOffers.find((offer) => offer.helpSlot);
  return {
    id: blocker.id,
    title: blocker.title,
    description: blocker.description,
    status: blocker.status as BlockerStatus,
    createdAt: blocker.createdAt.toISOString(),
    author: blocker.author,
    tags: blocker.tags.map((tag) => tag.name),
    stuckCount: blocker.stuckToos.length,
    helperCount: blocker.helpOffers.length,
    helperNames: blocker.helpOffers.map((offer) => offer.helper.name),
    viewerIsAuthor: viewerId === blocker.authorId,
    viewerStuckToo:
      viewerId !== null &&
      blocker.stuckToos.some((s) => s.attendeeId === viewerId),
    viewerOffer: viewerOffer
      ? { id: viewerOffer.id, status: viewerOffer.status as OfferStatus }
      : null,
    slot:
      claimedOffer && claimedOffer.helpSlot
        ? {
            startTime: claimedOffer.helpSlot.startTime.toISOString(),
            location: claimedOffer.helpSlot.location,
            durationMinutes: claimedOffer.helpSlot.durationMinutes,
            helperName: claimedOffer.helper.name,
          }
        : null,
  };
}

export async function listBlockers(
  eventId: string,
  viewerId: string | null,
  options: { tags: string[]; sort: "stuck" | "recent" },
): Promise<BlockerDTO[]> {
  const blockers = await prisma.blocker.findMany({
    where: {
      eventId,
      ...(options.tags.length > 0
        ? { tags: { some: { name: { in: options.tags } } } }
        : {}),
    },
    include: blockerInclude,
    orderBy: { createdAt: "desc" },
  });

  const dtos = blockers.map((b) => toBlockerDTO(b, viewerId));
  if (options.sort === "stuck") {
    dtos.sort((a, b) => b.stuckCount - a.stuckCount);
  }
  return dtos;
}

export async function createBlocker(
  eventId: string,
  authorId: string,
  input: CreateBlockerInput,
): Promise<BlockerDTO> {
  const blocker = await prisma.blocker.create({
    data: {
      eventId,
      authorId,
      title: input.title,
      description: input.description,
      tags: {
        connectOrCreate: input.tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: blockerInclude,
  });
  return toBlockerDTO(blocker, authorId);
}

export async function toggleStuckToo(
  blockerId: string,
  attendeeId: string,
): Promise<{ stuck: boolean; stuckCount: number }> {
  const blocker = await prisma.blocker.findUnique({ where: { id: blockerId } });
  if (!blocker) throw new ApiError("NOT_FOUND", "Blocker not found");
  if (blocker.authorId === attendeeId) {
    throw new ApiError("CONFLICT", "You posted this blocker — you're already stuck");
  }

  const existing = await prisma.stuckToo.findUnique({
    where: { blockerId_attendeeId: { blockerId, attendeeId } },
  });
  if (!existing) {
    const helpOffer = await prisma.helpOffer.findUnique({
      where: { blockerId_helperId: { blockerId, helperId: attendeeId } },
    });
    if (helpOffer) {
      throw new ApiError(
        "CONFLICT",
        "You're offering help on this blocker — withdraw help before marking stuck too",
      );
    }
  }
  if (existing) {
    await prisma.stuckToo.delete({ where: { id: existing.id } });
  } else {
    await prisma.stuckToo.create({ data: { blockerId, attendeeId } });
  }
  const stuckCount = await prisma.stuckToo.count({ where: { blockerId } });
  return { stuck: !existing, stuckCount };
}

export async function solveBlocker(
  blockerId: string,
  attendee: { id: string; role: string },
): Promise<BlockerDTO> {
  const blocker = await prisma.blocker.findUnique({ where: { id: blockerId } });
  if (!blocker) throw new ApiError("NOT_FOUND", "Blocker not found");
  if (blocker.authorId !== attendee.id && attendee.role !== ROLE.ORGANISER) {
    throw new ApiError(
      "FORBIDDEN",
      "Only the author or an organiser can mark a blocker solved",
    );
  }
  if (blocker.status === BLOCKER_STATUS.SOLVED) {
    throw new ApiError("CONFLICT", "Blocker is already solved");
  }

  const [, , updated] = await prisma.$transaction([
    prisma.helpOffer.updateMany({
      where: { blockerId, status: OFFER_STATUS.CLAIMED },
      data: { status: OFFER_STATUS.COMPLETED },
    }),
    prisma.blocker.update({
      where: { id: blockerId },
      data: { status: BLOCKER_STATUS.SOLVED },
    }),
    prisma.blocker.findUniqueOrThrow({
      where: { id: blockerId },
      include: blockerInclude,
    }),
  ]);
  return toBlockerDTO(updated, attendee.id);
}
