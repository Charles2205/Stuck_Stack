// String-union constants standing in for DB enums (Prisma has no enum support
// on SQLite — see docs/ARCHITECTURE.md §3). Zod validates these at the API edge.

export const BLOCKER_STATUS = {
  OPEN: "OPEN",
  MATCHED: "MATCHED",
  SOLVED: "SOLVED",
} as const;
export type BlockerStatus = (typeof BLOCKER_STATUS)[keyof typeof BLOCKER_STATUS];

export const ROLE = {
  ATTENDEE: "ATTENDEE",
  ORGANISER: "ORGANISER",
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

export const OFFER_STATUS = {
  OFFERED: "OFFERED",
  CLAIMED: "CLAIMED",
  COMPLETED: "COMPLETED",
} as const;
export type OfferStatus = (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS];

/** A tag becomes a clinic suggestion at >= this many OPEN blockers (+ >=1 helper). */
export const CLINIC_MIN_BLOCKERS = 3;

/** Default length of a pop-up clinic suggested to organisers. */
export const CLINIC_DURATION_MINUTES = 20;

export const DEMO_EVENT_SLUG = "gitnation-2026";

export const ATTENDEE_COOKIE = "attendeeId";

/** Starter vocabulary shown in tag pickers; attendees can add their own. */
export const SUGGESTED_TAGS = [
  "AI/LLMs",
  "RAG",
  "AI Deployment",
  "DevOps",
  "Next.js",
  "Databases",
  "Pitching",
] as const;

