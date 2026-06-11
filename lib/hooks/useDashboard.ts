"use client";

import useSWR from "swr";
import type { DashboardDTO } from "../types";
import { fetcher } from "./fetcher";

const DASHBOARD_POLL_MS = 5000;

export function useDashboard(slug: string) {
  const { data, error, isLoading, mutate } = useSWR<DashboardDTO>(
    `/api/events/${slug}/dashboard`,
    fetcher,
    { refreshInterval: DASHBOARD_POLL_MS, keepPreviousData: true },
  );
  return { dashboard: data, error, isLoading, mutate };
}
