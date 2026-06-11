"use client";

import { Badge } from "@progress/kendo-react-indicators";
import type { ClinicSuggestionDTO } from "@/lib/types";

export function ClinicSuggestions({
  clinics,
}: {
  clinics: ClinicSuggestionDTO[];
}) {
  if (clinics.length === 0) {
    return (
      <p className="text-sm text-slate-500">
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
          className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 flex flex-col gap-1"
        >
          <div className="flex items-center justify-between gap-2">
            <strong className="text-indigo-900">
              Suggested clinic: {clinic.title} — {clinic.location}
            </strong>
            <Badge themeColor="info" rounded="medium" position="inside" cutoutBorder={false}>
              {clinic.durationMinutes} min
            </Badge>
          </div>
          <p className="text-sm text-indigo-800">
            {clinic.openBlockers} open blockers · demand score {clinic.demand} ·{" "}
            {clinic.helpers} helper{clinic.helpers === 1 ? "" : "s"} available
          </p>
        </li>
      ))}
    </ul>
  );
}
