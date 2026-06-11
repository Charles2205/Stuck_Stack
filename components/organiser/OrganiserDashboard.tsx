"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { BlockerGrid } from "./BlockerGrid";
import { ClinicSuggestions } from "./ClinicSuggestions";

// Kendo Charts pull in hammerjs, which touches `window` at module scope —
// must be loaded client-side only.
const CategoryChart = dynamic(
  () => import("./CategoryChart").then((m) => m.CategoryChart),
  { ssr: false, loading: () => <p className="text-slate-500">Loading chart…</p> },
);

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

// Access control lives server-side in app/event/[slug]/organiser/page.tsx:
// only the organizer who owns the event reaches this component.
export function OrganiserDashboard({ slug }: { slug: string }) {
  const { dashboard } = useDashboard(slug);

  if (!dashboard) {
    return <p className="text-slate-500">Loading the live dashboard…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {dashboard.event.name} — live dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Updates every few seconds ·{" "}
            <Link href={`/event/${slug}`} className="underline">
              back to the board
            </Link>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Open blockers" value={dashboard.statusCounts.OPEN} />
        <Stat label="Matched" value={dashboard.statusCounts.MATCHED} />
        <Stat label="Solved" value={dashboard.statusCounts.SOLVED} />
        <Stat label="Stuck-too signals" value={dashboard.totals.stuckToos} />
        <Stat label="Help offers" value={dashboard.totals.offers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
          <h2 className="font-semibold">Suggested pop-up clinics</h2>
          <ClinicSuggestions clinics={dashboard.clinics} />
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <CategoryChart byTag={dashboard.byTag} />
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
        <h2 className="font-semibold">All blockers</h2>
        <BlockerGrid blockers={dashboard.blockers} />
      </section>
    </div>
  );
}
