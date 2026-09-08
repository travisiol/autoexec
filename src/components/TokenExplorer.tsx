"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Balloon } from "./Balloon";
import { Window } from "./Window";
import { wordPaint } from "@/lib/glyphs";
import {
  tokens,
  curvePercent,
  formatEth,
  formatPrice,
  GRADUATION_ETH,
  type Token,
} from "@/lib/tokens";
import { shortAddress } from "@/lib/site-config";

type Sort = "newest" | "cap" | "rounds" | "activity";

const SORTS: Array<{ key: Sort; label: string }> = [
  { key: "newest", label: "Newest" },
  { key: "cap", label: "Market cap" },
  { key: "rounds", label: "Rounds" },
  { key: "activity", label: "Activity" },
];

/** The ring around each token's avatar doubles as its progress to graduation. */
function CurveRing({ token }: { token: Token }) {
  const percent = curvePercent(token);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const graduated = token.stage === "pool";

  return (
    <div className="relative flex-none" style={{ width: 56, height: 56 }}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="rgba(20,90,40,0.14)"
          strokeWidth="5"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={graduated ? "#2ba81d" : "#8cf024"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          transform="rotate(-90 28 28)"
        />
      </svg>
      <span
        className="absolute inset-0 m-auto grid place-items-center rounded-full"
        style={{
          width: 34,
          height: 34,
          background: `radial-gradient(circle at 34% 26%, rgba(255,255,255,0.95), rgba(255,255,255,0) 55%), linear-gradient(to bottom, hsl(${token.hue} 90% 62%), hsl(${token.hue} 85% 34%))`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 6px rgba(10,60,20,0.25)",
          color: "#fff",
          fontFamily: "var(--font-display)",
          fontSize: 13,
          fontWeight: 600,
          textShadow: "0 1px 2px rgba(0,0,0,0.35)",
        }}
      >
        {token.ticker.slice(0, 2)}
      </span>
      <span className="sr-only">
        {graduated
          ? "Graduated to a locked pool"
          : `Curve ${percent} percent toward graduation`}
      </span>
    </div>
  );
}

function TokenCard({ token }: { token: Token }) {
  const percent = curvePercent(token);
  const graduated = token.stage === "pool";

  return (
    <Link href={`/coins/${token.address}`} className="card block">
      <div className="flex items-start gap-3">
        <CurveRing token={token} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="display truncate text-[18px]">{token.name}</h3>
            <span className="mono text-[11px] text-[var(--ink-muted)]">
              ${token.ticker}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[13px] text-[var(--ink-soft)]">
            {token.blurb}
          </p>
        </div>
        <span
          className={`pill ${token.status === "paused" ? "pill-idle" : ""}`}
        >
          <span
            className={`led ${token.status === "paused" ? "led-idle" : ""}`}
          />
          {token.status === "paused" ? "Paused" : "Running"}
        </span>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="stat-label">{graduated ? "Pool" : "Curve"}</span>
          <span className="mono text-[11px] text-[var(--ink-soft)]">
            {graduated
              ? "locked liquidity"
              : `${token.raised.toFixed(2)} / ${GRADUATION_ETH} ETH`}
          </span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[var(--line)] pt-3 sm:grid-cols-4">
        {[
          ["Price", formatPrice(token.priceEth)],
          ["Burned", token.burned],
          ["Bought back", formatEth(token.boughtBackEth)],
          [graduated ? "Graduated" : "On curve", `Round ${token.round}`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="stat-label">{label}</dt>
            <dd className="stat-value truncate">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mono mt-3 text-[10px] text-[var(--ink-muted)]">
        {shortAddress(token.address)}
      </p>
    </Link>
  );
}

export function TokenExplorer() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? tokens.filter((t) =>
          [t.name, t.ticker, t.address].some((field) =>
            field.toLowerCase().includes(needle),
          ),
        )
      : tokens.slice();

    const by: Record<Sort, (a: Token, b: Token) => number> = {
      newest: () => 0,
      cap: (a, b) => (b.marketCapEth ?? 0) - (a.marketCapEth ?? 0),
      rounds: (a, b) => b.round - a.round,
      activity: (a, b) => b.history.length - a.history.length,
    };
    return filtered.sort(by[sort]);
  }, [query, sort]);

  const active = tokens.filter((t) => t.status === "running").length;

  return (
    <section id="tokens" className="shell mt-20 scroll-mt-12">
      <div className="relative balloon-shadow mx-auto w-full max-w-[560px]">
        <Balloon
          paint={wordPaint("LIVE TOKENS")}
          aspect={4.6}
          label="Live tokens"
          className="h-[86px] w-full sm:h-[110px]"
          inflate={0.28}
        />
      </div>

      <Window
        className="mt-4"
        title={`Explorer — ${tokens.length} tokens, ${active} running`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <label className="min-w-[220px] flex-1">
            <span className="sr-only">Search by name, ticker or address</span>
            <input
              className="field"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, ticker or address"
            />
          </label>
          <div className="steps" role="tablist" aria-label="Sort tokens">
            {SORTS.map((option) => (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={sort === option.key}
                className="step"
                onClick={() => setSort(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {visible.map((token) => (
            <TokenCard key={token.address} token={token} />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="lede mt-6 text-center">
            Nothing matches “{query}”.
          </p>
        )}

        <p className="mono mt-5 border-t border-[var(--line)] pt-3 text-[11px] text-[var(--ink-muted)]">
          Sample data. No indexer is connected to this build, so these four
          tokens are fixed and their addresses are placeholders.
        </p>
      </Window>
    </section>
  );
}
