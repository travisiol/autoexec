"use client";

import { useEffect, useState } from "react";
import { StartOrb } from "./Taskbar";
import { tokens, actionLabels } from "@/lib/tokens";

/**
 * The tray notification, bottom-right. It cycles through the sample history so
 * the desktop has something happening on it — the same rounds shown on the
 * token pages, not invented events.
 */
const FEED = tokens
  .flatMap((token) =>
    token.history.map((entry) => ({
      ticker: token.ticker,
      label: actionLabels[entry.action]?.label ?? entry.action,
      amount: entry.amount,
      round: entry.round,
    })),
  )
  .filter((entry) => entry.amount !== "—");

const HOLD_MS = 7000;

export function Toast() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % FEED.length),
      HOLD_MS,
    );
    return () => window.clearInterval(id);
  }, [open]);

  if (!open || FEED.length === 0) return null;
  const entry = FEED[index];

  return (
    <div className="toast" role="status" key={index}>
      <div className="flex items-start gap-2.5">
        <StartOrb size={22} />
        <div className="min-w-0 flex-1">
          <p className="display text-[14px] leading-tight">
            ${entry.ticker} — {entry.label.toLowerCase()}
          </p>
          <p className="mono mt-0.5 text-[11px] text-[var(--ink-soft)]">
            {entry.amount} · round {entry.round}
          </p>
        </div>
        <button
          type="button"
          className="cap cap-close"
          onClick={() => setOpen(false)}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
