"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { diffBlockerNotifications } from "../notifications/diffBlockerNotifications";
import { playNotificationSound } from "../notifications/playNotificationSound";
import type { BoardToast } from "../notifications/types";
import type { BlockerDTO } from "../types";

const TOAST_TTL_MS = 6000;
const MAX_VISIBLE = 4;

export function useBoardNotifications(
  blockers: BlockerDTO[] | undefined,
  options: {
    enabled: boolean;
    viewerName: string | null;
  },
) {
  const baselineRef = useRef<BlockerDTO[] | null>(null);
  const readyRef = useRef(false);
  const [toasts, setToasts] = useState<BoardToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  /** Call after the viewer's own mutation so polling doesn't re-toast. */
  const syncBaseline = useCallback((snapshot: BlockerDTO[]) => {
    baselineRef.current = snapshot;
  }, []);

  useEffect(() => {
    if (!options.enabled || !blockers) return;

    if (!readyRef.current) {
      baselineRef.current = blockers;
      readyRef.current = true;
      return;
    }

    const prev = baselineRef.current ?? [];
    const incoming = diffBlockerNotifications(prev, blockers, {
      viewerName: options.viewerName,
    });
    baselineRef.current = blockers;

    if (incoming.length === 0) return;

    playNotificationSound();
    const now = Date.now();
    setToasts((current) => {
      const merged = [
        ...current,
        ...incoming.map((n) => ({ ...n, createdAt: now })),
      ];
      const next = merged.slice(-MAX_VISIBLE);
      for (const toast of incoming) {
        window.setTimeout(() => {
          setToasts((live) => live.filter((t) => t.id !== toast.id));
        }, TOAST_TTL_MS);
      }
      return next;
    });
  }, [blockers, options.enabled, options.viewerName]);

  return { toasts, dismissToast, syncBaseline };
}
