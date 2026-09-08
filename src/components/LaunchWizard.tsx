"use client";

import { useState } from "react";
import { Window } from "./Window";
import { siteConfig } from "@/lib/site-config";

/**
 * The launch flow, as an installer.
 *
 * Nothing here signs or sends anything: there is no contract behind this build
 * and no key generation, because a page that hands someone a private key it
 * generated in a marketing site is a page that loses someone's money. The
 * wizard collects the settings, shows exactly what would be submitted, and
 * stops at the point where a wallet would take over.
 */

const JOBS = [
  { key: "claim", label: "Claim fees", locked: true },
  { key: "buyback", label: "Buy back" },
  { key: "burn", label: "Burn" },
  { key: "treasury", label: "Fund treasury" },
  { key: "memory", label: "Remember rounds" },
  { key: "chat", label: "Talk to holders" },
];

export function LaunchWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [interval, setInterval] = useState(15);
  const [split, setSplit] = useState(20);
  const [treasury, setTreasury] = useState("");
  const [jobs, setJobs] = useState<string[]>([
    "claim",
    "buyback",
    "burn",
    "memory",
  ]);

  const toggleJob = (key: string) =>
    setJobs((current) =>
      current.includes(key)
        ? current.filter((j) => j !== key)
        : [...current, key],
    );

  const summary = {
    name: name || "—",
    ticker: ticker ? `$${ticker.toUpperCase()}` : "—",
    chain: siteConfig.chain,
    graduatesAt: `${siteConfig.graduationEth} ETH`,
    roundInterval: `${interval} min`,
    treasurySplit: `${split}%`,
    treasuryWallet: treasury || "—",
    jobs: jobs.join(", "),
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <Window
        focused
        title={`Launch Wizard — Step ${step + 1} of 2: ${
          step === 0 ? "Agent wallet" : "Token & agent"
        }`}
      >
        <div className="steps" role="tablist" aria-label="Launch steps">
          {["Agent wallet", "Token & agent"].map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={step === i}
              className={`step ${i < step ? "step-done" : ""}`}
              onClick={() => setStep(i)}
            >
              <span className="step-num">{i < step ? "✓" : i + 1}</span>
              {label}
            </button>
          ))}
        </div>

        {step === 0 ? (
          <div className="mt-5">
            <h2 className="display text-[22px]">Give the agent its own wallet</h2>
            <p className="lede mt-2">
              The agent signs its own transactions, on its own schedule, with
              nobody watching. That means it needs a key of its own — a fresh
              one, funded with a little gas and nothing else. Your owner wallet
              stays separate and keeps the only control that matters: the pause.
            </p>

            <div className="mt-4 rounded-[14px] border border-[rgba(200,140,10,0.35)] bg-[#fff9e6] p-4">
              <p className="display text-[15px]">
                Generate the key yourself, in your own wallet.
              </p>
              <p className="mt-1 text-[14px] text-[var(--ink-soft)]">
                This build will not create a private key for you and will not
                ask you to paste one. A site that hands you a key it generated
                is a site that has seen your key. Make a new account in your
                wallet, send it gas, and paste its <em>public</em> address
                below.
              </p>
            </div>

            <label className="mt-4 block">
              <span className="stat-label">Agent address (public)</span>
              <input
                className="field mt-1 mono"
                placeholder="0x…"
                value={treasury}
                onChange={(e) => setTreasury(e.target.value)}
              />
            </label>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="btn btn-go"
                onClick={() => setStep(1)}
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <h2 className="display text-[22px]">Describe the token</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="stat-label">Name</span>
                <input
                  className="field mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nightshift"
                />
              </label>
              <label className="block">
                <span className="stat-label">Ticker</span>
                <input
                  className="field mt-1 mono"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.slice(0, 10))}
                  placeholder="NIGHT"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="stat-label">
                  Round interval — {interval} min
                </span>
                <input
                  type="range"
                  min={siteConfig.roundMinutes[0]}
                  max={siteConfig.roundMinutes[1]}
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  className="mt-3 w-full accent-[var(--lime-500)]"
                />
              </label>
              <label className="block">
                <span className="stat-label">Treasury split — {split}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={split}
                  onChange={(e) => setSplit(Number(e.target.value))}
                  className="mt-3 w-full accent-[var(--lime-500)]"
                />
              </label>
            </div>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="stat-label">Jobs the agent may do</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {JOBS.map((job) => {
                  const on = job.locked || jobs.includes(job.key);
                  return (
                    <button
                      key={job.key}
                      type="button"
                      disabled={job.locked}
                      aria-pressed={on}
                      onClick={() => toggleJob(job.key)}
                      className={`pill ${on ? "" : "pill-off"}`}
                      style={{
                        height: 30,
                        padding: "0 13px",
                        cursor: job.locked ? "default" : "pointer",
                      }}
                    >
                      <span className={`led ${on ? "" : "led-off"}`} />
                      {job.label}
                      {job.locked && " · always"}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn"
                onClick={() => setStep(0)}
              >
                Back
              </button>
              <button type="button" className="btn btn-go" disabled>
                Launch — needs a wallet
              </button>
            </div>
            <p className="mono mt-2 text-[11px] text-[var(--ink-muted)]">
              No contract is deployed for this build, so the launch button stays
              disabled rather than opening a wallet that would fail.
            </p>
          </div>
        )}
      </Window>

      {/* Live summary of exactly what would be submitted. */}
      <Window title="Summary — what gets submitted">
        <dl className="m-0">
          {Object.entries(summary).map(([key, value]) => (
            <div
              key={key}
              className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-2 last:border-0"
            >
              <dt className="stat-label">
                {key.replace(/([A-Z])/g, " $1").toLowerCase()}
              </dt>
              <dd className="stat-value truncate text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </Window>
    </div>
  );
}
