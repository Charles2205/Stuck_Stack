import { describe, expect, it } from "vitest";
import {
  claimSlotSchema,
  createBlockerSchema,
  createEventSchema,
  joinEventSchema,
  listBlockersQuerySchema,
  organizerAuthSchema,
  updateEventSchema,
} from "@/lib/validation";

describe("joinEventSchema", () => {
  it("trims the name and defaults organiser to false", () => {
    const parsed = joinEventSchema.parse({ name: "  Maya  " });
    expect(parsed).toEqual({ name: "Maya", organiser: false });
  });

  it("rejects an empty name", () => {
    expect(joinEventSchema.safeParse({ name: "   " }).success).toBe(false);
  });
});

describe("createBlockerSchema", () => {
  const valid = {
    title: "Docker build fails on CI",
    description: "Works locally, exit code 139 on the runner.",
    tags: ["DevOps"],
  };

  it("accepts a valid blocker", () => {
    expect(createBlockerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a too-short title and empty tags", () => {
    expect(
      createBlockerSchema.safeParse({ ...valid, title: "Hm" }).success,
    ).toBe(false);
    expect(createBlockerSchema.safeParse({ ...valid, tags: [] }).success).toBe(
      false,
    );
  });

  it("caps tags at 5", () => {
    const tags = ["a1", "b2", "c3", "d4", "e5", "f6"];
    expect(createBlockerSchema.safeParse({ ...valid, tags }).success).toBe(
      false,
    );
  });
});

describe("listBlockersQuerySchema", () => {
  it("splits the tags param and defaults sort to stuck", () => {
    const parsed = listBlockersQuerySchema.parse({ tags: "RAG, DevOps ," });
    expect(parsed.tags).toEqual(["RAG", "DevOps"]);
    expect(parsed.sort).toBe("stuck");
  });

  it("yields no tag filter when the param is absent", () => {
    expect(listBlockersQuerySchema.parse({}).tags).toEqual([]);
  });
});

describe("claimSlotSchema", () => {
  it("defaults startInMinutes to 15", () => {
    expect(claimSlotSchema.parse({ location: "Table 1" }).startInMinutes).toBe(
      15,
    );
  });

  it("rejects out-of-range start times", () => {
    expect(
      claimSlotSchema.safeParse({ location: "Table 1", startInMinutes: 9999 })
        .success,
    ).toBe(false);
  });
});

describe("organizerAuthSchema", () => {
  it("requires at least 2 characters after trimming", () => {
    expect(organizerAuthSchema.safeParse({ name: " A " }).success).toBe(false);
    expect(organizerAuthSchema.parse({ name: " Al " }).name).toBe("Al");
  });
});

describe("createEventSchema", () => {
  const valid = {
    name: "React Summit 2027",
    slug: "react-summit-2027",
    date: "2027-03-10T09:00:00Z",
  };

  it("accepts a valid event and coerces the date", () => {
    const parsed = createEventSchema.parse(valid);
    expect(parsed.date).toBeInstanceOf(Date);
  });

  it("rejects invalid slugs", () => {
    for (const slug of ["Bad Slug", "UPPER", "-leading", "trailing-", "a"]) {
      expect(createEventSchema.safeParse({ ...valid, slug }).success).toBe(
        false,
      );
    }
  });
});

describe("updateEventSchema", () => {
  it("rejects an empty update", () => {
    expect(updateEventSchema.safeParse({}).success).toBe(false);
  });

  it("accepts a name-only update", () => {
    expect(updateEventSchema.safeParse({ name: "Renamed" }).success).toBe(true);
  });
});
