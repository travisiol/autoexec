import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Window } from "@/components/Window";
import { TokenChat } from "@/components/TokenChat";
import {
  findToken,
  tokens,
  actionLabels,
  curvePercent,
  formatEth,
  formatPrice,
  GRADUATION_ETH,
} from "@/lib/tokens";
import { siteConfig, shortAddress } from "@/lib/site-config";

export function generateStaticParams() {
  return tokens.map((token) => ({ token: token.address }));
}

export async function generateMetadata({
  params,
}: PageProps<"/coins/[token]">): Promise<Metadata> {
  const { token: address } = await params;
  const token = findToken(address);
  if (!token) return { title: "Token not found" };
  return { title: `${token.name} ($${token.ticker})`, description: token.blurb };
}

const relative = (minutes: number) => {
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
};

export default async function TokenPage({
  params,
}: PageProps<"/coins/[token]">) {
  const { token: address } = await params;
  const token = findToken(address);
  if (!token) notFound();

  const percent = curvePercent(token);
  const graduated = token.stage === "pool";

  return (
    <div className="shell pt-8 md:pt-12">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="grid gap-4">
          <Window
            focused
            title={`${token.name} — agent ${
              token.status === "paused" ? "paused" : "running"
            }, round ${token.round}`}
          >
            <div className="flex flex-wrap items-start gap-4">
              <span
                className="grid flex-none place-items-center rounded-full"
                style={{
                  width: 64,
                  height: 64,
                  background: `radial-gradient(circle at 34% 26%, rgba(255,255,255,0.95), rgba(255,255,255,0) 55%), linear-gradient(to bottom, hsl(${token.hue} 90% 62%), hsl(${token.hue} 85% 34%))`,
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.8), 0 6px 16px rgba(10,60,20,0.3)",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 600,
                  textShadow: "0 2px 4px rgba(0,0,0,0.35)",
                }}
              >
                {token.ticker.slice(0, 2)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="display m-0 text-[30px]">{token.name}</h1>
                  <span className="mono text-[13px] text-[var(--ink-muted)]">
                    ${token.ticker}
                  </span>
                  <span
                    className={`pill ${
                      token.status === "paused" ? "pill-idle" : ""
                    }`}
                  >
                    <span
                      className={`led ${
                        token.status === "paused" ? "led-idle" : ""
                      }`}
                    />
                    {token.status === "paused" ? "Paused" : "Running"}
                  </span>
                </div>
                <p className="lede mt-1 text-[15px]">{token.blurb}</p>
                <p className="mono mt-2 text-[11px] text-[var(--ink-muted)]">
                  {token.address}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="stat-label">
                  {graduated ? "Pool — liquidity locked" : "Curve"}
                </span>
                <span className="mono text-[12px] text-[var(--ink-soft)]">
                  {graduated
                    ? "graduated"
                    : `${token.raised.toFixed(2)} / ${GRADUATION_ETH} ETH`}
                </span>
              </div>
              <div className="bar" style={{ height: 18 }}>
                <div className="bar-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4 sm:grid-cols-4">
              {[
                ["Price", formatPrice(token.priceEth)],
                ["Market cap", formatEth(token.marketCapEth, 2)],
                ["Burned", token.burned],
                ["Bought back", formatEth(token.boughtBackEth)],
                ["Holders", String(token.holders)],
                ["Round", `#${token.round}`],
                ["Interval", `${token.intervalMinutes} min`],
                ["Treasury split", `${token.treasurySplit}%`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="stat-label">{label}</dt>
                  <dd className="stat-value">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn btn-go" disabled>
                Buy — needs a wallet
              </button>
              <button type="button" className="btn" disabled>
                Sell — needs a wallet
              </button>
              <Link href="/docs" className="btn">
                How rounds work
              </Link>
            </div>
            <p className="mono mt-2 text-[11px] text-[var(--ink-muted)]">
              Trading is disabled: no router or contract is configured in this
              build, so the buttons stay off rather than opening a wallet that
              would revert.
            </p>
          </Window>

          <Window title={`Activity log — ${token.name}, most recent first`}>
            <ol className="m-0 list-none p-0">
              {token.history.map((entry) => {
                const meta = actionLabels[entry.action];
                return (
                  <li
                    key={entry.round}
                    className="border-b border-[var(--line)] py-3 last:border-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pill">
                        <span className="led" />
                        {meta?.label ?? entry.action}
                      </span>
                      <span className="mono text-[12px] font-semibold">
                        {entry.amount}
                      </span>
                      <span className="mono ml-auto text-[11px] text-[var(--ink-muted)]">
                        round {entry.round} · {relative(entry.minutesAgo)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[14px] text-[var(--ink-soft)]">
                      {entry.reasoning}
                    </p>
                    <p className="mono mt-1 text-[10px] text-[var(--ink-muted)]">
                      {meta?.exe} · transaction link unavailable in this build
                    </p>
                  </li>
                );
              })}
            </ol>
          </Window>
        </div>

        <div className="grid gap-4">
          <Window title="Jobs — enabled for this agent">
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {Object.entries(actionLabels)
                .filter(([key]) => key !== "hold")
                .map(([key, meta]) => {
                  const on = token.jobs.includes(
                    key as (typeof token.jobs)[number],
                  );
                  return (
                    <li key={key}>
                      <span className={`pill ${on ? "" : "pill-off"}`}>
                        <span className={`led ${on ? "" : "led-off"}`} />
                        {meta.exe}
                      </span>
                    </li>
                  );
                })}
            </ul>
            <p className="mono mt-3 text-[11px] text-[var(--ink-muted)]">
              Only the owner wallet can change these.
            </p>
          </Window>

          <TokenChat ticker={token.ticker} />

          <Window title="Links">
            <div className="flex flex-col gap-2">
              <span className="mono text-[12px] text-[var(--ink-soft)]">
                Contract {shortAddress(token.address)}
              </span>
              <a
                href={siteConfig.x}
                target="_blank"
                rel="noreferrer noopener"
                className="btn"
              >
                {siteConfig.xHandle}
              </a>
              <Link href="/" className="btn">
                Back to all tokens
              </Link>
            </div>
          </Window>
        </div>
      </div>
    </div>
  );
}
