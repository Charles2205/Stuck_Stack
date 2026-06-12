"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { BlockerGrid } from "./BlockerGrid";
import { ClinicSuggestions } from "./ClinicSuggestions";
import { EventSharePanel } from "./EventSharePanel";

// Kendo Charts pull in hammerjs, which touches `window` at module scope —
// must be loaded client-side only.
const CategoryChart = dynamic(
  () => import("./CategoryChart").then((m) => m.CategoryChart),
  { ssr: false, loading: () => <p className="text-slate-500">Loading chart…</p> },
);

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="brutal-box p-4 border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111] bg-[#ffd200] odd:bg-[#00e5ff] flex flex-col justify-between">
      <p className="text-5xl lg:text-6xl font-black drop-shadow-[2px_2px_0px_#fff]">{value}</p>
      <p className="text-sm lg:text-base font-extrabold text-[#111] uppercase tracking-widest mt-2 border-t-[3px] border-[#111] pt-2">{label}</p>
    </div>
  );
}

// Access control lives server-side in app/event/[slug]/organiser/page.tsx:
// only the organizer who owns the event reaches this component.
export function OrganiserDashboard({ slug }: { slug: string }) {
  const { dashboard } = useDashboard(slug);


  if (!dashboard) {
    return <p className="text-[#111] font-bold text-xl brutal-box bg-[#ffd200] w-fit px-4 py-2 border-[3px]">Loading the live dashboard…</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col items-start gap-4 mb-4">
        <div className="brutal-box bg-[#ff3d00] p-6 lg:p-8 border-[4px] border-[#111] shadow-[8px_8px_0px_0px_#111] rotate-1 z-10">
          <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-[3px_3px_0px_#111]">
            {dashboard.event.name}
            <br />
            <span className="bg-white text-[#111] px-2 text-3xl lg:text-5xl drop-shadow-none border-[3px] border-[#111] mt-2 inline-block -rotate-2">
              Live Dashboard
            </span>
          </h1>
        </div>
        <div className="bg-white border-[3px] border-[#111] p-3 font-bold shadow-[4px_4px_0px_0px_#111] translate-x-4 -mt-2">
          Updates every few seconds ·{" "}
          <Link href={`/event/${slug}`} className="underline decoration-2 underline-offset-4 text-[#ff3d00]">
            back to the board
          </Link>
        </div>
      </header>

      <EventSharePanel
        slug={dashboard.event.slug}
        eventName={dashboard.event.name}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Open blockers" value={dashboard.statusCounts.OPEN} />
        <Stat label="Matched" value={dashboard.statusCounts.MATCHED} />
        <Stat label="Solved" value={dashboard.statusCounts.SOLVED} />
        <Stat label="Stuck-too signals" value={dashboard.totals.stuckToos} />
        <Stat label="Help offers" value={dashboard.totals.offers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="brutal-box bg-[#00e5ff] p-5 flex flex-col gap-3">
          <h2 className="font-extrabold text-xl">Suggested pop-up clinics</h2>
          <ClinicSuggestions clinics={dashboard.clinics} />
        </section>
        <section className="brutal-box bg-white p-5">
          <CategoryChart byTag={dashboard.byTag} />
        </section>
      </div>

      <section className="brutal-box bg-white p-5 flex flex-col gap-3">
        <h2 className="font-extrabold text-xl">All blockers</h2>
        <BlockerGrid blockers={dashboard.blockers} />
      </section>
    </div>
  );
}
