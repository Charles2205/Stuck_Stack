import type { BlockerDTO } from "../types";
import type { BoardNotification } from "./types";

export type DiffBlockerNotificationsOptions = {
  /** Suppress help-offer toasts when the viewer is the new helper (matched by name). */
  viewerName: string | null;
};

function isSubscribed(blocker: BlockerDTO): boolean {
  return blocker.viewerIsAuthor || blocker.viewerStuckToo;
}

function stuckTooMessage(delta: number, title: string, asAuthor: boolean): string {
  const label = asAuthor ? "your blocker" : `"${title}"`;
  if (delta === 1) {
    return asAuthor
      ? `Someone is stuck too on ${label}.`
      : `Another person is stuck on ${label}.`;
  }
  return `${delta} more people are stuck on ${label}.`;
}

/**
 * Compares two blocker snapshots (from SWR polling) and returns toast-worthy
 * events for the current viewer. Skips the initial baseline (caller passes
 * prev only after first load).
 */
export function diffBlockerNotifications(
  prev: BlockerDTO[],
  next: BlockerDTO[],
  options: DiffBlockerNotificationsOptions,
): BoardNotification[] {
  const prevById = new Map(prev.map((b) => [b.id, b]));
  const out: BoardNotification[] = [];

  for (const blocker of next) {
    const before = prevById.get(blocker.id);
    if (!before) continue;

    const deltaStuck = blocker.stuckCount - before.stuckCount;
    if (deltaStuck > 0) {
      if (blocker.viewerIsAuthor) {
        out.push({
          id: `${blocker.id}:stuck:author:${blocker.stuckCount}`,
          kind: "stuck-too",
          blockerId: blocker.id,
          blockerTitle: blocker.title,
          message: stuckTooMessage(deltaStuck, blocker.title, true),
        });
      } else if (
        blocker.viewerStuckToo &&
        before.viewerStuckToo &&
        !blocker.viewerIsAuthor
      ) {
        out.push({
          id: `${blocker.id}:stuck:peer:${blocker.stuckCount}`,
          kind: "stuck-too",
          blockerId: blocker.id,
          blockerTitle: blocker.title,
          message: stuckTooMessage(deltaStuck, blocker.title, false),
        });
      }
    }

    const newHelpers = blocker.helperNames.filter(
      (name) => !before.helperNames.includes(name),
    );
    if (newHelpers.length > 0 && isSubscribed(blocker)) {
      for (const helperName of newHelpers) {
        if (options.viewerName && helperName === options.viewerName) continue;
        out.push({
          id: `${blocker.id}:help:${helperName}`,
          kind: "help-offer",
          blockerId: blocker.id,
          blockerTitle: blocker.title,
          message: `${helperName} can help with "${blocker.title}".`,
        });
      }
    }
  }

  return out;
}
