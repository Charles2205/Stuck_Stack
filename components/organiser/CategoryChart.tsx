"use client";

import "hammerjs";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartTitle,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
import type { TagStatDTO } from "@/lib/types";

const TOP_N = 8;

export function CategoryChart({ byTag }: { byTag: TagStatDTO[] }) {
  const top = byTag.slice(0, TOP_N);
  const categories = top.map((t) => t.tag);

  return (
    <Chart style={{ height: 360, background: "transparent" }}>
      <ChartTitle
        text="Where people are stuck"
        font="900 24px var(--font-sans), sans-serif"
        color="#111"
        margin={{ bottom: 24 }}
      />
      <ChartLegend
        position="bottom"
        labels={{ font: "800 16px var(--font-sans), sans-serif", color: "#111" }}
      />
      <ChartCategoryAxis>
        <ChartCategoryAxisItem
          categories={categories}
          labels={{ font: "800 14px var(--font-sans), sans-serif", color: "#111", rotation: "auto" }}
          majorGridLines={{ visible: false }}
          line={{ width: 4, color: "#111" }}
        />
      </ChartCategoryAxis>
      <ChartValueAxis>
        <ChartValueAxisItem
          majorUnit={5}
          labels={{ font: "800 14px var(--font-sans), sans-serif", color: "#111" }}
          majorGridLines={{ color: "#111", width: 2, dashType: "solid" }}
          line={{ width: 4, color: "#111" }}
        />
      </ChartValueAxis>
      <ChartSeries>
        <ChartSeriesItem
          type="column"
          name="Demand (blockers + stuck-too)"
          data={top.map((t) => t.demand)}
          color="#ff3d00"
          border={{ width: 3, color: "#111" }}
        />
        <ChartSeriesItem
          type="column"
          name="Helpers available"
          data={top.map((t) => t.helpers)}
          color="#00e5ff"
          border={{ width: 3, color: "#111" }}
        />
      </ChartSeries>
    </Chart>
  );
}
