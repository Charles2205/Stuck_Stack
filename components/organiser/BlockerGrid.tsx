"use client";

import { useState } from "react";
import { process, type State } from "@progress/kendo-data-query";
import { Grid, GridColumn, GridColumnMenuFilter } from "@progress/kendo-react-grid";

const ColumnMenu = (props: any) => {
  return (
    <div>
      <GridColumnMenuFilter {...props} expanded={true} />
    </div>
  );
};
import type { BlockerDTO } from "@/lib/types";

type GridRow = {
  id: string;
  title: string;
  author: string;
  tags: string;
  status: string;
  stuckCount: number;
  helperCount: number;
  createdAt: Date;
};

const INITIAL_STATE: State = {
  sort: [{ field: "stuckCount", dir: "desc" }],
};

export function BlockerGrid({ blockers }: { blockers: BlockerDTO[] }) {
  const [dataState, setDataState] = useState<State>(INITIAL_STATE);

  const rows: GridRow[] = blockers.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author.name,
    tags: b.tags.join(", "),
    status: b.status,
    stuckCount: b.stuckCount,
    helperCount: b.helperCount,
    createdAt: new Date(b.createdAt),
  }));

  return (
    <Grid
      data={process(rows, dataState)}
      {...dataState}
      sortable
      onDataStateChange={(e) => setDataState(e.dataState)}
      style={{ maxHeight: 520 }}
    >
      <GridColumn field="title" title="Blocker" columnMenu={ColumnMenu} />
      <GridColumn field="author" title="Author" width="140px" columnMenu={ColumnMenu} />
      <GridColumn field="tags" title="Tags" width="180px" columnMenu={ColumnMenu} />
      <GridColumn field="status" title="Status" width="120px" columnMenu={ColumnMenu} />
      <GridColumn
        field="stuckCount"
        title="Stuck too"
        width="120px"
        filter="numeric"
        columnMenu={ColumnMenu}
      />
      <GridColumn
        field="helperCount"
        title="Helpers"
        width="110px"
        filter="numeric"
        columnMenu={ColumnMenu}
      />
      <GridColumn
        field="createdAt"
        title="Posted"
        width="150px"
        filter="date"
        format="{0:HH:mm}"
        columnMenu={ColumnMenu}
      />
    </Grid>
  );
}
