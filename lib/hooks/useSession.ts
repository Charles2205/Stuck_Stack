"use client";

import useSWR from "swr";
import type { AttendeeDTO } from "../types";
import { fetcher } from "./fetcher";

/** Hydrates the current attendee from the httpOnly session cookie. */
export function useSession() {
  const { data, isLoading, mutate } = useSWR<{ attendee: AttendeeDTO | null }>(
    "/api/me",
    fetcher,
  );
  return { attendee: data?.attendee ?? null, isLoading, mutate };
}
