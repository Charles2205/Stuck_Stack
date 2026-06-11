import type { Organizer } from "@prisma/client";
import { ApiError } from "../api";
import { prisma } from "../db";

/** Case-insensitive identity key (see docs/ARCHITECTURE.md §10). */
export function toNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export async function signUp(name: string): Promise<Organizer> {
  const trimmed = name.trim();
  const nameKey = toNameKey(trimmed);
  const existing = await prisma.organizer.findUnique({ where: { nameKey } });
  if (existing) {
    throw new ApiError(
      "CONFLICT",
      `An organizer named "${existing.name}" already exists — sign in instead`,
    );
  }
  return prisma.organizer.create({ data: { name: trimmed, nameKey } });
}

export async function signIn(name: string): Promise<Organizer> {
  const organizer = await prisma.organizer.findUnique({
    where: { nameKey: toNameKey(name) },
  });
  if (!organizer) {
    throw new ApiError("NOT_FOUND", "No organizer with that name");
  }
  return organizer;
}
