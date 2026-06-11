// Zod schemas — the single source of truth for input shapes, used by route
// handlers and reused client-side for form parity.

import { z } from "zod";

export const joinEventSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  organiser: z.boolean().optional().default(false),
});
export type JoinEventInput = z.infer<typeof joinEventSchema>;

export const createBlockerSchema = z.object({
  title: z.string().trim().min(5, "Give your blocker a clear title").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Add enough detail for a helper to recognise the problem")
    .max(1000),
  tags: z
    .array(z.string().trim().min(1).max(30))
    .min(1, "Pick at least one tag")
    .max(5),
});
export type CreateBlockerInput = z.infer<typeof createBlockerSchema>;

export const listBlockersQuerySchema = z.object({
  tags: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    ),
  sort: z.enum(["stuck", "recent"]).optional().default("stuck"),
});

export const claimSlotSchema = z.object({
  location: z.string().trim().min(1, "Where should you meet?").max(100),
  startInMinutes: z.number().int().min(0).max(8 * 60).optional().default(15),
});
export type ClaimSlotInput = z.infer<typeof claimSlotSchema>;

// --- Organizer auth + workspace ---

export const organizerAuthSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters").max(60),
});
export type OrganizerAuthInput = z.infer<typeof organizerAuthSchema>;

const eventSlugSchema = z
  .string()
  .trim()
  .min(3, "Slug needs at least 3 characters")
  .max(60)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens (e.g. gitnation-2026)",
  );

export const createEventSchema = z.object({
  name: z.string().trim().min(3, "Give the event a name").max(80),
  slug: eventSlugSchema,
  date: z.coerce.date<Date>(),
});
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z
  .object({
    name: z.string().trim().min(3).max(80).optional(),
    date: z.coerce.date<Date>().optional(),
  })
  .refine((v) => v.name !== undefined || v.date !== undefined, {
    message: "Nothing to update",
  });
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
