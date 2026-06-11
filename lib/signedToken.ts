// Pure HMAC token helpers backing the organizer session cookie. Kept free of
// Next.js/Prisma imports so they're unit-testable in isolation.

import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET =
  process.env.SESSION_SECRET ?? "stuck-stack-dev-secret-set-me-in-production";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

/** Builds the cookie value "<id>.<HMAC-SHA256 signature>". */
export function createToken(id: string): string {
  return `${id}.${sign(id)}`;
}

/** Returns the embedded id if the signature checks out, otherwise null. */
export function verifyToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(id));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}
