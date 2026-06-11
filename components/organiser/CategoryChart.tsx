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
    <Chart style={{ height: 320 }}>
      <ChartTitle text="Where people are stuck (open demand by tag)" />
      <ChartLegend position="bottom" />
      <ChartCategoryAxis>
        <ChartCategoryAxisItem
          categories={categories}
          labels={{ rotation: "auto" }}
        />
      </ChartCategoryAxis>
      <ChartValueAxis>
        <ChartValueAxisItem majorUnit={5} />
      </ChartValueAxis>
      <ChartSeries>
        <ChartSeriesItem
          type="column"
          name="Demand (blockers + stuck-too)"
          data={top.map((t) => t.demand)}
          color="#6366f1"
        />
        <ChartSeriesItem
          type="column"
          name="Helpers available"
          data={top.map((t) => t.helpers)}
          color="#10b981"
        />
      </ChartSeries>
    </Chart>
  );
}
