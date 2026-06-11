// Organizer session: httpOnly cookie holding "<organizerId>.<HMAC signature>".
// Demo-grade by design (no password) but tamper-proof — the cookie is useless
// without the server's SESSION_SECRET. Fully independent from the attendee
// cookie in lib/session.ts. Production path: swap this module for NextAuth
// email magic links; getCurrentOrganizer() keeps its signature
// (docs/ARCHITECTURE.md §10).

import { cookies } from "next/headers";
import type { Organizer } from "@prisma/client";
import { ApiError } from "./api";
import { prisma } from "./db";
import { createToken, verifyToken } from "./signedToken";

export const ORGANIZER_COOKIE = "organizer_session";

export async function setOrganizerCookie(organizerId: string): Promise<void> {
  const store = await cookies();
  store.set(ORGANIZER_COOKIE, createToken(organizerId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearOrganizerCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ORGANIZER_COOKIE);
}

export async function getCurrentOrganizer(): Promise<Organizer | null> {
  const store = await cookies();
  const token = store.get(ORGANIZER_COOKIE)?.value;
  if (!token) return null;
  const id = verifyToken(token);
  if (!id) return null;
  return prisma.organizer.findUnique({ where: { id } });
}

export async function requireOrganizer(): Promise<Organizer> {
  const organizer = await getCurrentOrganizer();
  if (!organizer) {
    throw new ApiError("UNAUTHORIZED", "Sign in as an organizer first");
  }
  return organizer;
}
