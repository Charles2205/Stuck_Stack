import { describe, expect, it } from "vitest";
import { diffBlockerNotifications } from "@/lib/notifications/diffBlockerNotifications";
import type { BlockerDTO } from "@/lib/types";

function blocker(overrides: Partial<BlockerDTO> & Pick<BlockerDTO, "id">): BlockerDTO {
  return {
    title: "RAG vs fine-tuning",
    description: "Help",
    status: "OPEN",
    createdAt: "2026-06-01T10:00:00.000Z",
    author: { id: "author-1", name: "Maya" },
    tags: ["RAG"],
    stuckCount: 0,
    helperCount: 0,
    helperNames: [],
    viewerIsAuthor: false,
    viewerStuckToo: false,
    viewerOffer: null,
    slot: null,
    ...overrides,
  };
}

describe("diffBlockerNotifications", () => {
  it("notifies the author when stuck-too count rises", () => {
    const prev = [blocker({ id: "b1", viewerIsAuthor: true, stuckCount: 2 })];
    const next = [blocker({ id: "b1", viewerIsAuthor: true, stuckCount: 3 })];
    const events = diffBlockerNotifications(prev, next, { viewerName: "Maya" });
    expect(events).toHaveLength(1);
    expect(events[0]?.kind).toBe("stuck-too");
    expect(events[0]?.message).toContain("your blocker");
  });

  it("notifies stuck-too subscribers when count rises", () => {
    const prev = [blocker({ id: "b1", viewerStuckToo: true, stuckCount: 4 })];
    const next = [blocker({ id: "b1", viewerStuckToo: true, stuckCount: 5 })];
    const events = diffBlockerNotifications(prev, next, { viewerName: "Tom" });
    expect(events).toHaveLength(1);
    expect(events[0]?.message).toContain("Another person");
  });

  it("notifies subscribers when a new helper appears", () => {
    const prev = [
      blocker({
        id: "b1",
        viewerIsAuthor: true,
        helperNames: [],
        helperCount: 0,
      }),
    ];
    const next = [
      blocker({
        id: "b1",
        viewerIsAuthor: true,
        helperNames: ["Jonas"],
        helperCount: 1,
      }),
    ];
    const events = diffBlockerNotifications(prev, next, { viewerName: "Maya" });
    expect(events).toHaveLength(1);
    expect(events[0]?.kind).toBe("help-offer");
    expect(events[0]?.message).toContain("Jonas can help");
  });

  it("skips help toast when the viewer is the new helper", () => {
    const prev = [blocker({ id: "b1", viewerStuckToo: true, helperNames: [] })];
    const next = [
      blocker({
        id: "b1",
        viewerStuckToo: true,
        helperNames: ["Tom"],
        helperCount: 1,
      }),
    ];
    const events = diffBlockerNotifications(prev, next, { viewerName: "Tom" });
    expect(events).toHaveLength(0);
  });

  it("ignores blockers that were not in the previous snapshot", () => {
    const prev: BlockerDTO[] = [];
    const next = [blocker({ id: "b-new", viewerIsAuthor: true, stuckCount: 1 })];
    expect(diffBlockerNotifications(prev, next, { viewerName: null })).toHaveLength(
      0,
    );
  });
});
