import type { BlockerDTO } from "../types";

/** Column `status` ids passed to Kendo TaskBoard. */
export type TaskboardColumnId =
  | "mine"
  | "stuck"
  | "helping"
  | "open"
  | "matched"
  | "solved";

export type TaskboardColumnDef = {
  id: TaskboardColumnId;
  title: string;
  headerClass: string;
};

export const PERSONAL_COLUMNS: TaskboardColumnDef[] = [
  { id: "mine", title: "My blockers", headerClass: "bg-[#ffd200]" },
  { id: "stuck", title: "Stuck with me", headerClass: "bg-[#ff9100]" },
  { id: "helping", title: "I'm helping", headerClass: "bg-[#00e676]" },
  { id: "open", title: "Open", headerClass: "bg-[#00e5ff]" },
  { id: "matched", title: "Matched", headerClass: "bg-[#ff3d00] text-white" },
  { id: "solved", title: "Solved", headerClass: "bg-[#111] text-white" },
];

export const STATUS_COLUMNS: TaskboardColumnDef[] = [
  { id: "open", title: "Open", headerClass: "bg-[#00e5ff]" },
  { id: "matched", title: "Matched", headerClass: "bg-[#ff9100]" },
  { id: "solved", title: "Solved", headerClass: "bg-[#00e676]" },
];

/**
 * Assigns each blocker to exactly one TaskBoard column. Personal columns take
 * priority when the viewer is a joined attendee.
 */
export function assignBlockerColumn(
  blocker: BlockerDTO,
  personalView: boolean,
): TaskboardColumnId {
  if (personalView) {
    if (blocker.viewerIsAuthor) return "mine";
    if (blocker.viewerOffer) return "helping";
    if (blocker.viewerStuckToo) return "stuck";
  }

  switch (blocker.status) {
    case "MATCHED":
      return "matched";
    case "SOLVED":
      return "solved";
    default:
      return "open";
  }
}

export function sortBlockersForColumn(
  blockers: BlockerDTO[],
  sort: "stuck" | "recent",
): BlockerDTO[] {
  const copy = [...blockers];
  if (sort === "stuck") {
    copy.sort((a, b) => b.stuckCount - a.stuckCount);
  } else {
    copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  return copy;
}

export function buildColumnData(
  defs: TaskboardColumnDef[],
  blockers: BlockerDTO[],
  personalView: boolean,
  sort: "stuck" | "recent",
) {
  const byColumn = new Map<TaskboardColumnId, BlockerDTO[]>();
  for (const def of defs) byColumn.set(def.id, []);

  for (const blocker of blockers) {
    const columnId = assignBlockerColumn(blocker, personalView);
    const bucket = byColumn.get(columnId);
    if (bucket) bucket.push(blocker);
  }

  return defs.map((def, index) => {
    const items = sortBlockersForColumn(byColumn.get(def.id) ?? [], sort);
    return {
      column: {
        id: def.id,
        title: `${def.title} (${items.length})`,
        status: def.id,
        index,
      },
      blockers: items,
      headerClass: def.headerClass,
    };
  });
}
