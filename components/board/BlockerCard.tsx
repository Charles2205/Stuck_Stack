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
  OPEN: { border: "border-l-indigo-500", label: "Open", theme: "info" },
  MATCHED: { border: "border-l-amber-500", label: "Matched", theme: "warning" },
  SOLVED: { border: "border-l-emerald-500", label: "Solved", theme: "success" },
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
      className={`border-l-4 ${style.border} ${solved ? "opacity-70" : ""}`}
    >
      <CardHeader className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <CardTitle className="!text-base !font-semibold leading-snug">
            {blocker.title}
          </CardTitle>
          <CardSubtitle className="!text-xs">
            {blocker.author.name} ·{" "}
            {new Date(blocker.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </CardSubtitle>
        </div>
        <Badge
          themeColor={style.theme}
          rounded="medium"
          position="inside"
          cutoutBorder={false}
        >
          {style.label}
        </Badge>
      </CardHeader>
      <CardBody className="flex flex-col gap-3">
        <p className="text-sm text-slate-600 line-clamp-3">
          {blocker.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {blocker.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-100 text-slate-700 rounded-full px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-6 text-sm text-slate-600">
          <BadgeContainer>
            <span className="pr-2">Stuck too</span>
            <Badge themeColor="error" rounded="full" size="small">
              {blocker.stuckCount}
            </Badge>
          </BadgeContainer>
          <BadgeContainer>
            <span className="pr-2">Helpers</span>
            <Badge themeColor="success" rounded="full" size="small">
              {blocker.helperCount}
            </Badge>
          </BadgeContainer>
        </div>
        {blocker.slot && (
          <p className="text-xs rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1.5">
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
        <CardActions className="flex flex-wrap gap-2">
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
