"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Balloon } from "./Balloon";
import { Window } from "./Window";
import { wordPaint, markPaint } from "@/lib/glyphs";
import { siteConfig } from "@/lib/site-config";

/**
 * The four steps read as an installer's wizard: one is highlighted at a time,
 * a progress bar fills, and it advances on its own. Clicking a step takes
 * over — an auto-advancing panel that fights the reader is worse than one that
 * never moved.
 */
const STEPS = [
  {
    key: "launch",
    label: "Launch",
    title: "Launch",
    body: `A name, a ticker, an image. One transaction puts the token on the ${siteConfig.chain} and starts its agent with its own wallet.`,
  },
  {
    key: "trade",
    label: "Trade",
    title: "Trade",
    body: `Trading opens on a bonding curve with a ${siteConfig.curveFeePct}% fee. At ${siteConfig.graduationEth} ETH the curve graduates into a pool and the liquidity is locked.`,
  },
  {
    key: "earn",
    label: "Earn",
    title: "Earn",
    body: "Every trade sends creator fees to escrow. The agent claims them at the start of each round — unless they are worth less than the gas, in which case it waits.",
  },
  {
    key: "compound",
    label: "Compound",
    title: "Compound",
    body: "Then it decides: buy its own token, burn what it holds, or send a share to your treasury. It writes down why, and reads that back next round.",
  },
];

const AUTO_ADVANCE_MS = 5200;

export function Hero() {
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % STEPS.length),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearInterval(id);
  }, [manual]);

  const step = STEPS[active];

  return (
    <section className="shell pt-8 md:pt-12">
      <div className="relative">
        {/* The wordmark is a rendered object, not type. It gets its own row so
            the balloon has air above and below it. */}
        <div className="relative balloon-shadow mx-auto w-full max-w-[880px]">
          <Balloon
            paint={wordPaint(siteConfig.name)}
            aspect={4.4}
            label={siteConfig.name}
            className="h-[132px] w-full sm:h-[180px] md:h-[220px]"
            inflate={0.3}
            bulge={1.05}
          />
        </div>

        <div className="relative mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
          <Window
            title={`Welcome Center — How it works, step ${active + 1} of ${STEPS.length}`}
            focused
            icon={
              <span className="mono" style={{ fontSize: 10, opacity: 0.7 }}>
                {active + 1}/{STEPS.length}
              </span>
            }
          >
            <p className="display text-[30px] leading-[1.08] sm:text-[42px]">
              Launchpad for{" "}
              <span style={{ color: "var(--lime-600)" }}>tokenized agents.</span>
            </p>
            <p className="lede mt-3">
              Create a token and it comes with a process attached. The process
              collects the fees the token earns, spends them back into it, and
              shows its work every round — with nobody at the keyboard.
            </p>

            <div
              className="steps mt-6"
              role="tablist"
              aria-label="How it works"
            >
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className={`step ${i < active ? "step-done" : ""}`}
                  onClick={() => {
                    setActive(i);
                    setManual(true);
                  }}
                >
                  <span className="step-num">{i < active ? "✓" : i + 1}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-[14px] border border-[var(--line)] bg-[rgba(244,255,238,0.7)] p-4">
              <h3 className="display text-[18px]">{step.title}</h3>
              <p className="lede mt-1 text-[15px]">{step.body}</p>
              <div className="bar mt-4">
                <div
                  className="bar-fill"
                  style={{
                    width: `${((active + 1) / STEPS.length) * 100}%`,
                    transitionDuration: manual ? "0.4s" : `${AUTO_ADVANCE_MS}ms`,
                    transitionTimingFunction: "linear",
                  }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/launch" className="btn btn-go btn-lg">
                Launch a token
              </Link>
              <a href="#tokens" className="btn btn-lg">
                See live agents
              </a>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--line)] pt-4 sm:grid-cols-3">
              {[
                [`${siteConfig.graduationEth} ETH`, "to graduate"],
                [`${siteConfig.curveFeePct}%`, "curve fee"],
                [
                  `${siteConfig.roundMinutes[0]}–${siteConfig.roundMinutes[1]} min`,
                  "per round",
                ],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="stat-value text-[17px]">{value}</dt>
                  <dd className="stat-label">{label}</dd>
                </div>
              ))}
            </dl>
          </Window>

          {/* The mark, floating beside the window like a desktop toy. */}
          <div className="relative balloon-shadow mx-auto hidden w-[240px] lg:block">
            <Balloon
              paint={markPaint}
              aspect={1}
              label={`${siteConfig.name} mark`}
              className="h-[240px] w-[240px]"
              inflate={0.36}
              bulge={1.2}
              sway={14}
              bob={0.1}
              resolution={200}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
