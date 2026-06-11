"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@progress/kendo-react-buttons";
import { QRCodeSVG } from "qrcode.react";

type CopyState = "idle" | "copied" | "error";

const subscribeToOrigin = () => () => {};
const getServerOrigin = () => "";
const getBrowserOrigin = () => window.location.origin;

function writeClipboardFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) throw new Error("Copy command failed");
}

export function EventSharePanel({
  slug,
  eventName,
}: {
  slug: string;
  eventName: string;
}) {
  const qrRef = useRef<SVGSVGElement | null>(null);
  const joinPath = useMemo(() => `/event/${slug}`, [slug]);
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    getBrowserOrigin,
    getServerOrigin,
  );
  const shareUrl = useMemo(
    () => (origin ? new URL(joinPath, origin).toString() : joinPath),
    [joinPath, origin],
  );
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function copyJoinLink() {
    setCopyState("idle");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        writeClipboardFallback(shareUrl);
      }
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  }

  function downloadQrCode() {
    if (!qrRef.current) return;

    const svg = qrRef.current.cloneNode(true) as SVGSVGElement;
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}-join-qr.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="grid grid-cols-1 gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-950">
            Share the event join QR
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Put this QR code on a slide, screen, or printed sign. Participants
            open the event board from it, join by name, then post blockers or
            offer help.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs font-medium text-slate-500">Join link</p>
          <p className="break-all font-mono text-sm text-slate-800">
            {shareUrl}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button themeColor="primary" onClick={copyJoinLink}>
            {copyState === "copied" ? "Copied" : "Copy join link"}
          </Button>
          <Button fillMode="outline" onClick={downloadQrCode}>
            Download QR
          </Button>
          <Link
            href={joinPath}
            className="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium text-indigo-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Open join page
          </Link>
        </div>

        <p aria-live="polite" className="min-h-5 text-sm text-slate-500">
          {copyState === "error"
            ? "Could not copy the link. Select the join link above instead."
            : copyState === "copied"
              ? "Join link copied."
              : ""}
        </p>
      </div>

      <div className="flex w-full justify-center lg:w-auto">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <QRCodeSVG
            ref={qrRef}
            value={shareUrl}
            size={184}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#0f172a"
            title={`${eventName} join QR code`}
            className="h-44 w-44 sm:h-48 sm:w-48"
          />
        </div>
      </div>
    </section>
  );
}
