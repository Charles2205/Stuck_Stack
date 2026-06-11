import { ApiError } from "../api";
import { BLOCKER_STATUS, OFFER_STATUS } from "../constants";
import { prisma } from "../db";
import type { BlockerDTO } from "../types";
import { blockerInclude, toBlockerDTO } from "./blockers";
import type { ClaimSlotInput } from "../validation";

export async function offerHelp(
  blockerId: string,
  helperId: string,
): Promise<{ offerId: string; helperCount: number }> {
  const blocker = await prisma.blocker.findUnique({ where: { id: blockerId } });
  if (!blocker) throw new ApiError("NOT_FOUND", "Blocker not found");
  if (blocker.authorId === helperId) {
    throw new ApiError("CONFLICT", "You can't offer help on your own blocker");
  }
  if (blocker.status === BLOCKER_STATUS.SOLVED) {
    throw new ApiError("CONFLICT", "This blocker is already solved");
  }

  // Idempotent: re-offering returns the existing offer.
  const offer = await prisma.helpOffer.upsert({
    where: { blockerId_helperId: { blockerId, helperId } },
    update: {},
    create: { blockerId, helperId },
  });
  const helperCount = await prisma.helpOffer.count({ where: { blockerId } });
  return { offerId: offer.id, helperCount };
}

export async function claimSlot(
  offerId: string,
  attendeeId: string,
  input: ClaimSlotInput,
): Promise<BlockerDTO> {
  const offer = await prisma.helpOffer.findUnique({
    where: { id: offerId },
    include: { blocker: true, helpSlot: true },
  });
  if (!offer) throw new ApiError("NOT_FOUND", "Help offer not found");
  if (offer.helperId !== attendeeId) {
    throw new ApiError("FORBIDDEN", "Only the helper who offered can claim this slot");
  }
  if (offer.helpSlot) {
    throw new ApiError("CONFLICT", "This offer already has a slot");
  }
  if (offer.blocker.status === BLOCKER_STATUS.SOLVED) {
    throw new ApiError("CONFLICT", "This blocker is already solved");
  }

  const startTime = new Date(Date.now() + input.startInMinutes * 60_000);
  const [, , , updated] = await prisma.$transaction([
    prisma.helpSlot.create({
      data: {
        helpOfferId: offer.id,
        startTime,
        location: input.location,
        durationMinutes: 5,
      },
    }),
    prisma.helpOffer.update({
      where: { id: offer.id },
      data: { status: OFFER_STATUS.CLAIMED },
    }),
    prisma.blocker.update({
      where: { id: offer.blockerId },
      data: { status: BLOCKER_STATUS.MATCHED },
    }),
    prisma.blocker.findUniqueOrThrow({
      where: { id: offer.blockerId },
      include: blockerInclude,
    }),
  ]);
  return toBlockerDTO(updated, attendeeId);
}
