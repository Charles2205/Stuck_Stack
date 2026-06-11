// Organizer session: httpOnly cookie holding "<organizerId>.<HMAC signature>".
// Demo-grade by design (no password) but tamper-proof — the cookie is useless
// without the server's SESSION_SECRET. Fully independent from the attendee
// cookie in lib/session.ts. Production path: swap this module for NextAuth
// email magic links; getCurrentOrganizer() keeps its signature
// (docs/ARCHITECTURE.md §10).

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Organizer } from "@prisma/client";
import { ApiError } from "./api";
import { prisma } from "./db";

export const ORGANIZER_COOKIE = "organizer_session";

const SECRET =
  process.env.SESSION_SECRET ?? "stuck-stack-dev-secret-set-me-in-production";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

function verifyToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(id);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

export async function setOrganizerCookie(organizerId: string): Promise<void> {
  const store = await cookies();
  store.set(ORGANIZER_COOKIE, `${organizerId}.${sign(organizerId)}`, {
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
