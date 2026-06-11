// Demo-grade session: the attendee id lives in an httpOnly cookie set on join.
// Production path: replace this module with NextAuth and keep the
// getSessionAttendee()/requireAttendee() signatures (docs/ARCHITECTURE.md §7).

import { cookies } from "next/headers";
import type { Attendee } from "@prisma/client";
import { ApiError } from "./api";
import { ATTENDEE_COOKIE } from "./constants";
import { prisma } from "./db";

export async function setAttendeeCookie(attendeeId: string): Promise<void> {
  const store = await cookies();
  store.set(ATTENDEE_COOKIE, attendeeId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSessionAttendee(): Promise<Attendee | null> {
  const store = await cookies();
  const id = store.get(ATTENDEE_COOKIE)?.value;
  if (!id) return null;
  return prisma.attendee.findUnique({ where: { id } });
}

export async function requireAttendee(): Promise<Attendee> {
  const attendee = await getSessionAttendee();
  if (!attendee) {
    throw new ApiError("UNAUTHORIZED", "Join the event first");
  }
  return attendee;
}
