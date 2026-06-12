"use client";

import { useMemo } from "react";
import {
  TaskBoard,
  type TaskBoardPriority,
  type TaskBoardTaskModel,
} from "@progress/kendo-react-taskboard";
import {
  buildColumnData,
  PERSONAL_COLUMNS,
  STATUS_COLUMNS,
} from "@/lib/board/taskboardColumns";
import type { AttendeeDTO, BlockerDTO } from "@/lib/types";
import {
  BlockerTaskBoardColumn,
  createBlockerTaskBoardCard,
} from "./BlockerTaskBoardParts";

const PRIORITIES: TaskBoardPriority[] = [
  { priority: "Open", color: "#00e5ff" },
  { priority: "Matched", color: "#ff9100" },
  { priority: "Solved", color: "#00e676" },
];

type Props = {
  blockers: BlockerDTO[];
  personalView: boolean;
  sort: "stuck" | "recent";
  viewer: AttendeeDTO | null;
  busyId: string | null;
  onStuckToo: (blocker: BlockerDTO) => void;
  onOfferHelp: (blocker: BlockerDTO) => void;
  onClaimSlot: (blocker: BlockerDTO) => void;
  onSolve: (blocker: BlockerDTO) => void;
};

export function BlockerTaskBoard({
  blockers,
  personalView,
  sort,
  viewer,
  busyId,
  onStuckToo,
  onOfferHelp,
  onClaimSlot,
  onSolve,
}: Props) {
  const columnDefs = personalView ? PERSONAL_COLUMNS : STATUS_COLUMNS;

  const board = useMemo(
    () => buildColumnData(columnDefs, blockers, personalView, sort),
    [blockers, columnDefs, personalView, sort],
  );

  const columnData = useMemo(
    () => board.map(({ column }) => column),
    [board],
  );

  const taskData = useMemo(() => {
    const tasks: TaskBoardTaskModel[] = [];
    for (const group of board) {
      group.blockers.forEach((blocker, index) => {
        tasks.push({
          id: blocker.id,
          title: blocker.title,
          status: group.column.status,
          description: blocker.description,
          priority: {
            priority: blocker.status,
            color:
              blocker.status === "SOLVED"
                ? "#00e676"
                : blocker.status === "MATCHED"
                  ? "#ff9100"
                  : "#00e5ff",
          },
          index,
        });
      });
    }
    return tasks;
  }, [board]);

  const blockersById = useMemo(
    () => new Map(blockers.map((blocker) => [blocker.id, blocker])),
    [blockers],
  );

  const CardComponent = useMemo(
    () =>
      createBlockerTaskBoardCard({
        blockersById,
        viewer,
        busyId,
        onStuckToo,
        onOfferHelp,
        onClaimSlot,
        onSolve,
      }),
    [
      blockersById,
      viewer,
      busyId,
      onStuckToo,
      onOfferHelp,
      onClaimSlot,
      onSolve,
    ],
  );

  if (blockers.length === 0) return null;

  return (
    <div className="blocker-taskboard brutal-box bg-[#fffbef] border-[4px] border-[#111] shadow-[8px_8px_0px_0px_#111] overflow-hidden">
      <TaskBoard
        className="blocker-taskboard-kendo"
        columnData={columnData}
        taskData={taskData}
        priorities={PRIORITIES}
        onChange={() => {
          /* Columns are computed from blocker state — drag is display-only. */
        }}
        column={BlockerTaskBoardColumn}
        card={CardComponent}
      />
    </div>
  );
}
