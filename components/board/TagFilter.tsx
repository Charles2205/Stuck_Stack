"use client";

import { MultiSelect } from "@progress/kendo-react-dropdowns";

type Props = {
  available: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
};

export function TagFilter({ available, selected, onChange }: Props) {
  return (
    <MultiSelect
      data={available}
      value={selected}
      onChange={(e) => onChange(e.value as string[])}
      placeholder="Filter by tag…"
      style={{ minWidth: 260 }}
    />
  );
}
