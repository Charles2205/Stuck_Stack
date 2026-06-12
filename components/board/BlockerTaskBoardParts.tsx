"use client";

import type { TaskBoardCardProps } from "@progress/kendo-react-taskboard";
import {
  TaskBoardColumn,
  type TaskBoardColumnHeaderProps,
  type TaskBoardColumnProps,
} from "@progress/kendo-react-taskboard";
import type { AttendeeDTO, BlockerDTO } from "@/lib/types";
import type { TaskboardColumnId } from "@/lib/board/taskboardColumns";
import { BlockerCard } from "./BlockerCard";

const COLUMN_HEADER_CLASS: Record<TaskboardColumnId, string> = {
  mine: "bg-[#ffd200]",
  stuck: "bg-[#ff9100]",
  helping: "bg-[#00e676]",
  open: "bg-[#00e5ff]",
  matched: "bg-[#ff3d00] text-white",
  solved: "bg-[#111] text-white",
};

function BrutalColumnHeader({
  column,
  tasks,
  columnHeaderId,
}: TaskBoardColumnHeaderProps) {
  const status = column.status as TaskboardColumnId;
  const headerClass = COLUMN_HEADER_CLASS[status] ?? "bg-white";

  return (
    <div
      id={columnHeaderId}
      className={`border-b-[4px] border-[#111] px-4 py-3 ${headerClass}`}
    >
      <h3 className="text-lg font-black uppercase tracking-tighter text-inherit">
        {column.title}
      </h3>
      <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-90">
        {tasks.length === 1 ? "1 card" : `${tasks.length} cards`}
      </p>
    </div>
  );
}

export function BlockerTaskBoardColumn(props: TaskBoardColumnProps) {
  return (
    <TaskBoardColumn
      {...props}
      showAddCard={false}
      showEditCard={false}
      showColumnConfirmDelete={false}
      header={BrutalColumnHeader}
    />
  );
}

type CardFactoryArgs = {
  blockersById: Map<string, BlockerDTO>;
  viewer: AttendeeDTO | null;
  busyId: string | null;
  onStuckToo: (blocker: BlockerDTO) => void;
  onOfferHelp: (blocker: BlockerDTO) => void;
  onClaimSlot: (blocker: BlockerDTO) => void;
  onSolve: (blocker: BlockerDTO) => void;
};

export function createBlockerTaskBoardCard({
  blockersById,
  viewer,
  busyId,
  onStuckToo,
  onOfferHelp,
  onClaimSlot,
  onSolve,
}: CardFactoryArgs) {
  return function BlockerTaskBoardCard(props: TaskBoardCardProps) {
    const blocker = blockersById.get(String(props.task.id));
    if (!blocker) return null;

    return (
      <div className="blocker-taskboard-card">
        <BlockerCard
          blocker={blocker}
          viewer={viewer}
          busy={busyId === blocker.id}
          onStuckToo={onStuckToo}
          onOfferHelp={onOfferHelp}
          onClaimSlot={onClaimSlot}
          onSolve={onSolve}
        />
      </div>
    );
  };
}
