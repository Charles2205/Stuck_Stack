// DTO types shared between the API layer and the UI. Dates cross the wire as
// ISO strings.

import type { BlockerStatus, OfferStatus, Role } from "./constants";

export type AttendeeDTO = {
  id: string;
  name: string;
  role: Role;
  eventSlug: string;
};

export type SlotDTO = {
  startTime: string;
  location: string;
  durationMinutes: number;
  helperName: string;
};

export type BlockerDTO = {
  id: string;
  title: string;
  description: string;
  status: BlockerStatus;
  createdAt: string;
  author: { id: string; name: string };
  tags: string[];
  stuckCount: number;
  helperCount: number;
  helperNames: string[];
  viewerIsAuthor: boolean;
  viewerStuckToo: boolean;
  viewerOffer: { id: string; status: OfferStatus } | null;
  slot: SlotDTO | null;
};

export type TagStatDTO = {
  tag: string;
  openBlockers: number;
  totalBlockers: number;
  demand: number; // open blockers + stuck-too signals on them
  helpers: number;
};

export type ClinicSuggestionDTO = {
  tag: string;
  title: string;
  openBlockers: number;
  demand: number;
  helpers: number;
  location: string;
  durationMinutes: number;
};

export type DashboardDTO = {
  event: { name: string; slug: string };
  statusCounts: Record<BlockerStatus, number>;
  totals: { blockers: number; attendees: number; stuckToos: number; offers: number };
  byTag: TagStatDTO[];
  clinics: ClinicSuggestionDTO[];
  blockers: BlockerDTO[];
};

export type OrganizerDTO = {
  id: string;
  name: string;
};

export type WorkspaceEventDTO = {
  id: string;
  name: string;
  slug: string;
  date: string;
  createdAt: string;
  counts: {
    blockers: number;
    open: number;
    matched: number;
    solved: number;
    attendees: number;
  };
};

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};
