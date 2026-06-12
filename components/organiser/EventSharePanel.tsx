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
    <section className="grid grid-cols-1 gap-5 brutal-box bg-[#ffd200] p-6 lg:p-8 lg:grid-cols-[1fr_auto] lg:items-center shadow-[6px_6px_0px_0px_#111] border-[4px] border-[#111]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-[#111] uppercase tracking-tighter drop-shadow-[2px_2px_0px_#fff]">
            Share the event join QR
          </h2>
          <p className="max-w-2xl text-base font-bold leading-6 text-[#111]">
            Put this QR code on a slide, screen, or printed sign. Participants
            open the event board from it, join by name, then post blockers or
            offer help.
          </p>
        </div>

        <div className="brutal-box bg-white px-4 py-3 border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111]">
          <p className="text-sm font-extrabold text-[#111] uppercase tracking-widest mb-1">Join link</p>
          <p className="break-all font-mono text-base font-bold text-[#ff3d00]">
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
            className="inline-flex min-h-9 items-center brutal-box bg-[#00e5ff] px-4 py-2 text-base font-black uppercase tracking-wider text-[#111] hover:bg-[#00b2cc] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black shadow-[4px_4px_0px_0px_#111]"
          >
            Open join page
          </Link>
        </div>

        <p aria-live="polite" className="min-h-5 text-sm font-bold text-[#111]">
          {copyState === "error"
            ? "Could not copy the link. Select the join link above instead."
            : copyState === "copied"
              ? "Join link copied."
              : ""}
        </p>
      </div>

      <div className="flex w-full justify-center lg:w-auto">
        <div className="brutal-box bg-white p-4 border-[4px] border-[#111] shadow-[8px_8px_0px_0px_#111] rotate-2">
          <QRCodeSVG
            ref={qrRef}
            value={shareUrl}
            size={184}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#111111"
            title={`${eventName} join QR code`}
            className="h-44 w-44 sm:h-56 sm:w-56"
          />
        </div>
      </div>
    </section>
  );
}
