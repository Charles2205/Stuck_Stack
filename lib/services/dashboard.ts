import {
  BLOCKER_STATUS,
  CLINIC_DURATION_MINUTES,
  CLINIC_MIN_BLOCKERS,
  type BlockerStatus,
} from "../constants";
import { prisma } from "../db";
import type { ClinicSuggestionDTO, DashboardDTO, TagStatDTO } from "../types";
import { blockerInclude, toBlockerDTO } from "./blockers";

/**
 * Clinic suggestions are computed at read time, never stored: any tag with
 * >= CLINIC_MIN_BLOCKERS open blockers and >= 1 distinct helper becomes a
 * suggested pop-up clinic, ranked by demand (open blockers + stuck-too
 * signals). Solving blockers dissolves the cluster on the next poll.
 */
export async function getDashboard(
  eventId: string,
  viewerId: string | null,
): Promise<Omit<DashboardDTO, "event">> {
  const [blockers, attendeeCount] = await Promise.all([
    prisma.blocker.findMany({
      where: { eventId },
      include: blockerInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.attendee.count({ where: { eventId } }),
  ]);

  const statusCounts: Record<BlockerStatus, number> = {
    OPEN: 0,
    MATCHED: 0,
    SOLVED: 0,
  };
  let stuckTooTotal = 0;
  let offerTotal = 0;

  type TagAccumulator = {
    open: number;
    total: number;
    demand: number;
    helperIds: Set<string>;
  };
  const byTag = new Map<string, TagAccumulator>();

  for (const blocker of blockers) {
    statusCounts[blocker.status as BlockerStatus] += 1;
    stuckTooTotal += blocker.stuckToos.length;
    offerTotal += blocker.helpOffers.length;

    const isOpen = blocker.status === BLOCKER_STATUS.OPEN;
    for (const tag of blocker.tags) {
      const acc = byTag.get(tag.name) ?? {
        open: 0,
        total: 0,
        demand: 0,
        helperIds: new Set<string>(),
      };
      acc.total += 1;
      if (isOpen) {
        acc.open += 1;
        acc.demand += 1 + blocker.stuckToos.length;
        for (const offer of blocker.helpOffers) acc.helperIds.add(offer.helperId);
      }
      byTag.set(tag.name, acc);
    }
  }

  const tagStats: TagStatDTO[] = [...byTag.entries()]
    .map(([tag, acc]) => ({
      tag,
      openBlockers: acc.open,
      totalBlockers: acc.total,
      demand: acc.demand,
      helpers: acc.helperIds.size,
    }))
    .sort((a, b) => b.demand - a.demand);

  const clinics: ClinicSuggestionDTO[] = tagStats
    .filter((t) => t.openBlockers >= CLINIC_MIN_BLOCKERS && t.helpers >= 1)
    .map((t, i) => ({
      tag: t.tag,
      title: `${t.tag} Help Desk`,
      openBlockers: t.openBlockers,
      demand: t.demand,
      helpers: t.helpers,
      // Deterministic pop-up location: highest-demand cluster gets Table 3,
      // the next Table 4, and so on (Tables 1-2 are the standing help desks).
      location: `Table ${3 + i}`,
      durationMinutes: CLINIC_DURATION_MINUTES,
    }));

  return {
    statusCounts,
    totals: {
      blockers: blockers.length,
      attendees: attendeeCount,
      stuckToos: stuckTooTotal,
      offers: offerTotal,
    },
    byTag: tagStats,
    clinics,
    blockers: blockers.map((b) => toBlockerDTO(b, viewerId)),
  };
}
