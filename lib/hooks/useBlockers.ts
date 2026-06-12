"use client";

// The polling swap point: replace `refreshInterval` with an EventSource
// subscription calling `mutate()` to move to SSE — no component changes
// (docs/ARCHITECTURE.md §5).

import useSWR from "swr";
import type { BlockerDTO } from "../types";
import { fetcher } from "./fetcher";

const BOARD_POLL_MS = 3000;

export function useBlockers(
  slug: string,
  options: { sort: "stuck" | "recent" },
) {
  const params = new URLSearchParams();
  params.set("sort", options.sort);

  const { data, error, isLoading, mutate } = useSWR<{ blockers: BlockerDTO[] }>(
    `/api/events/${slug}/blockers?${params.toString()}`,
    fetcher,
    { refreshInterval: BOARD_POLL_MS, keepPreviousData: true },
  );
  return { blockers: data?.blockers, error, isLoading, mutate };
}
