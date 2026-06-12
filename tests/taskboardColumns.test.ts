import { describe, expect, it } from "vitest";
import {
  assignBlockerColumn,
  buildColumnData,
  PERSONAL_COLUMNS,
} from "@/lib/board/taskboardColumns";
import type { BlockerDTO } from "@/lib/types";

function blocker(overrides: Partial<BlockerDTO> & Pick<BlockerDTO, "id">): BlockerDTO {
  return {
    title: "Test",
    description: "Desc",
    status: "OPEN",
    createdAt: "2026-06-01T10:00:00.000Z",
    author: { id: "a1", name: "Maya" },
    tags: [],
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

describe("assignBlockerColumn", () => {
  it("routes authored blockers to mine in personal view", () => {
    expect(
      assignBlockerColumn(blocker({ id: "1", viewerIsAuthor: true }), true),
    ).toBe("mine");
  });

  it("routes help offers to helping before open", () => {
    expect(
      assignBlockerColumn(
        blocker({
          id: "1",
          viewerOffer: { id: "o1", status: "OFFERED" },
        }),
        true,
      ),
    ).toBe("helping");
  });

  it("routes stuck-too to stuck column in personal view", () => {
    expect(
      assignBlockerColumn(blocker({ id: "1", viewerStuckToo: true }), true),
    ).toBe("stuck");
  });

  it("uses status columns when not personal", () => {
    expect(
      assignBlockerColumn(blocker({ id: "1", status: "MATCHED" }), false),
    ).toBe("matched");
  });
});

describe("buildColumnData", () => {
  it("places each blocker in exactly one column", () => {
    const blockers = [
      blocker({ id: "1", viewerIsAuthor: true }),
      blocker({ id: "2", viewerStuckToo: true }),
      blocker({ id: "3", status: "OPEN" }),
    ];
    const board = buildColumnData(PERSONAL_COLUMNS, blockers, true, "recent");
    const placed = board.flatMap((col) => col.blockers);
    expect(placed).toHaveLength(3);
    expect(placed.map((b) => b.id).sort()).toEqual(["1", "2", "3"]);
  });
});
