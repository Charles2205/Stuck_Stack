"use client";

import { Button } from "@progress/kendo-react-buttons";
import { Badge, BadgeContainer } from "@progress/kendo-react-indicators";
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from "@progress/kendo-react-layout";
import type { BlockerStatus } from "@/lib/constants";
import type { AttendeeDTO, BlockerDTO } from "@/lib/types";

const STATUS_STYLE: Record<
  BlockerStatus,
  { border: string; label: string; theme: "info" | "warning" | "success" }
> = {
  OPEN: { border: "border-l-[#00e5ff]", label: "Open", theme: "info" },
  MATCHED: { border: "border-l-[#ff9100]", label: "Matched", theme: "warning" },
  SOLVED: { border: "border-l-[#00e676]", label: "Solved", theme: "success" },
};

type Props = {
  blocker: BlockerDTO;
  viewer: AttendeeDTO | null;
  busy: boolean;
  onStuckToo: (blocker: BlockerDTO) => void;
  onOfferHelp: (blocker: BlockerDTO) => void;
  onClaimSlot: (blocker: BlockerDTO) => void;
  onSolve: (blocker: BlockerDTO) => void;
};

export function BlockerCard({
  blocker,
  viewer,
  busy,
  onStuckToo,
  onOfferHelp,
  onClaimSlot,
  onSolve,
}: Props) {
  const style = STATUS_STYLE[blocker.status];
  const solved = blocker.status === "SOLVED";
  const canSolve =
    viewer !== null &&
    !solved &&
    (blocker.viewerIsAuthor || viewer.role === "ORGANISER");

  return (
    <Card
      className={`border-l-8 ${style.border} ${solved ? "opacity-70" : ""}`}
    >
      <CardHeader className="flex flex-col gap-2 border-b-[3px] border-[#111] pb-3 mb-2">
        <div>
          <Badge
            themeColor={style.theme}
            rounded="medium"
            cutoutBorder={false}
          >
            {style.label}
          </Badge>
        </div>
        <div className="min-w-0">
          <CardTitle className="!text-xl !font-black uppercase tracking-tighter leading-snug">
            {blocker.title}
          </CardTitle>
          <CardSubtitle className="!text-sm !font-bold text-[#111] mt-1 bg-[#ffd200] px-2 py-0.5 border-2 border-[#111] w-fit">
            {blocker.author.name} ·{" "}
            {new Date(blocker.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </CardSubtitle>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-3">
        <p className="text-base text-[#111] font-bold leading-relaxed line-clamp-3">
          {blocker.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {blocker.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#ffd200] text-[#111] font-bold border-2 border-[#111] px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-4 text-sm text-[#111] font-black uppercase tracking-wide">
          <div className="flex items-center gap-2 border-[3px] border-[#111] px-2 py-1 shadow-[2px_2px_0px_0px_#111]">
            <span>Stuck too</span>
            <span className="bg-[#ff3d00] text-white px-2 py-0.5 border-2 border-[#111]">{blocker.stuckCount}</span>
          </div>
          <div className="flex items-center gap-2 border-[3px] border-[#111] px-2 py-1 shadow-[2px_2px_0px_0px_#111]">
            <span>Helpers</span>
            <span className="bg-[#00e676] text-[#111] px-2 py-0.5 border-2 border-[#111]">{blocker.helperCount}</span>
          </div>
        </div>
        {blocker.slot && (
          <p className="text-xs bg-[#00e5ff] border-2 border-[#111] text-[#111] font-bold px-2 py-1.5 shadow-[2px_2px_0px_0px_#111]">
            <strong>{blocker.slot.helperName}</strong> helps at{" "}
            {new Date(blocker.slot.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {blocker.slot.location} · {blocker.slot.durationMinutes} min
          </p>
        )}
      </CardBody>
      {viewer && !solved && (
        <CardActions
          className="flex flex-wrap gap-2"
          style={{ flexFlow: "row wrap", flexWrap: "wrap", display: "flex", gap: "8px" }}
        >
          {!blocker.viewerIsAuthor && (
            <Button
              size="small"
              togglable
              selected={blocker.viewerStuckToo}
              disabled={busy}
              onClick={() => onStuckToo(blocker)}
            >
              {blocker.viewerStuckToo ? "✓ Stuck too" : "I'm stuck too"}
            </Button>
          )}
          {!blocker.viewerIsAuthor && !blocker.viewerOffer && (
            <Button
              size="small"
              themeColor="success"
              disabled={busy}
              onClick={() => onOfferHelp(blocker)}
            >
              I can help
            </Button>
          )}
          {blocker.viewerOffer?.status === "OFFERED" && (
            <Button
              size="small"
              themeColor="primary"
              disabled={busy}
              onClick={() => onClaimSlot(blocker)}
            >
              Claim a 5-min slot
            </Button>
          )}
          {canSolve && (
            <Button
              size="small"
              fillMode="outline"
              themeColor="success"
              disabled={busy}
              onClick={() => onSolve(blocker)}
            >
              Mark solved
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
}
