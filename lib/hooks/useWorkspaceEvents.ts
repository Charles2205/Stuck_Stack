"use client";

import useSWR from "swr";
import type { WorkspaceEventDTO } from "../types";
import { fetcher } from "./fetcher";

/** The organizer's events. No polling — workspace data only changes through
 * the organizer's own actions, which call mutate() directly. */
export function useWorkspaceEvents() {
  const { data, error, isLoading, mutate } = useSWR<{
    events: WorkspaceEventDTO[];
  }>("/api/workspace/events", fetcher);
  return { events: data?.events, error, isLoading, mutate };
}
