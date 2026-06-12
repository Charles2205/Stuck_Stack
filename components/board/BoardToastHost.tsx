"use client";

import type { BoardToast } from "@/lib/notifications/types";

const KIND_STYLE: Record<
  BoardToast["kind"],
  { bg: string; accent: string; label: string }
> = {
  "stuck-too": {
    bg: "bg-[#ffd200]",
    accent: "bg-[#ff3d00]",
    label: "Stuck too",
  },
  "help-offer": {
    bg: "bg-[#00e676]",
    accent: "bg-[#00e5ff]",
    label: "Helper",
  },
};

export function BoardToastHost({
  toasts,
  onDismiss,
}: {
  toasts: BoardToast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex w-[min(100vw-2rem,22rem)] flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Board notifications"
    >
      {toasts.map((toast) => {
        const style = KIND_STYLE[toast.kind];
        return (
          <div
            key={`${toast.id}-${toast.createdAt}`}
            className={`pointer-events-auto brutal-box border-[3px] border-[#111] p-4 shadow-[6px_6px_0px_0px_#111] ${style.bg}`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <span
                  className={`text-xs font-black uppercase tracking-widest text-[#111] w-fit px-2 py-0.5 border-2 border-[#111] ${style.accent}`}
                >
                  {style.label}
                </span>
                <p className="text-sm font-bold text-[#111] leading-snug">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-lg font-black leading-none text-[#111] hover:bg-[#111] hover:text-white border-2 border-[#111] w-7 h-7"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
