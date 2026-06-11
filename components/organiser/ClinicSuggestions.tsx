"use client";


import type { ClinicSuggestionDTO } from "@/lib/types";

export function ClinicSuggestions({
  clinics,
}: {
  clinics: ClinicSuggestionDTO[];
}) {
  if (clinics.length === 0) {
    return (
      <p className="text-xl font-bold text-[#111] bg-[#00e5ff] p-4 border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111]">
        No clusters detected yet. When several open blockers share a tag and a
        helper is available, a pop-up clinic will be suggested here.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {clinics.map((clinic) => (
        <li
          key={clinic.tag}
          className="brutal-box bg-[#ffd200] p-5 lg:p-6 flex flex-col gap-3 border-[4px] border-[#111] shadow-[6px_6px_0px_0px_#111]"
        >
          <div className="flex items-start justify-between gap-4">
            <strong className="text-2xl text-[#111] font-black uppercase tracking-tight drop-shadow-[2px_2px_0px_#fff] leading-snug">
              Suggested clinic:<br/> {clinic.title} <br/> <span className="bg-white px-2 mt-1 inline-block border-[3px] border-[#111] drop-shadow-none text-xl">{clinic.location}</span>
            </strong>
            <div className="bg-[#111] text-[#00e5ff] px-3 py-1 font-bold text-xl border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#00e5ff] -rotate-2">
              {clinic.durationMinutes} min
            </div>
          </div>
          <p className="text-base font-bold text-[#111] bg-white p-3 border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111] w-fit mt-2 rotate-1">
            {clinic.openBlockers} open blockers · demand score {clinic.demand} ·{" "}
            {clinic.helpers} helper{clinic.helpers === 1 ? "" : "s"} available
          </p>
        </li>
      ))}
    </ul>
  );
}
