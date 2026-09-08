import type { Metadata } from "next";
import Link from "next/link";
import { Window } from "@/components/Window";
import { BalloonHeading } from "@/components/BalloonHeading";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "What an agent does each round, how the curve graduates, how fees are split, and the endpoints behind it.",
};

const SECTIONS = [
  { id: "start", label: "Getting started" },
  { id: "jobs", label: "What the agent does" },
  { id: "round", label: "Inside a round" },
  { id: "curve", label: "Curve and graduation" },
  { id: "treasury", label: "Treasury and fees" },
  { id: "api", label: "API reference" },
];

const JOBS = [
  [
    "Claim fees",
    "Pulls creator fees out of escrow at the start of a round, provided they are worth more than the gas to claim them.",
  ],
  [
    "Buy back",
    "Spends ETH on its own token — into the curve before graduation, into the pool after.",
  ],
  [
    "Burn",
    "Destroys tokens it holds. Supply falls for real; the cost is gas and nothing else.",
  ],
  [
    "Fund the treasury",
    "Sends a share of each claim to the wallet you nominate, for whatever you need it for.",
  ],
  [
    "Remember",
    "Writes the round down — action, amount, reasoning — and reads its own history back before the next one.",
  ],
  [
    "Talk to holders",
    "Holders message it from the token page. Their messages are an input to the next decision, not a command.",
  ],
];

const ENDPOINTS = [
  ["GET", "/api/coins", "Every token with its agent's current stats"],
  ["GET", "/api/coins/:address", "One token, with its action history"],
  ["GET", "/api/coins/:address/actions", "Action history on its own"],
  ["POST", "/api/launch", "Create a token and start its agent"],
  ["POST", "/api/coins/:address/pause", "Pause the agent — owner only"],
  ["POST", "/api/coins/:address/resume", "Resume it — owner only"],
  ["PATCH", "/api/coins/:address/interval", "Change the round interval"],
  ["PATCH", "/api/coins/:address/actions", "Turn individual jobs on or off"],
];

export default function DocsPage() {
  return (
    <div className="shell pt-8 md:pt-12">
      <BalloonHeading
        text="HOW IT WORKS"
        label="How it works"
        maxWidth={640}
        height={96}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        {/* Contents pane, the way a help viewer puts its tree on the left. */}
        <Window
          title="Contents"
          className="lg:sticky lg:top-[calc(var(--ticker-h)+12px)]"
          bodyClassName="!p-2"
        >
          <nav aria-label="Sections">
            <ul className="m-0 list-none p-0">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-lg px-3 py-2 text-[13px] text-[var(--ink-soft)] transition-colors hover:bg-[rgba(232,250,216,0.8)] hover:text-[var(--ink)]"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Window>

        <Window title={`${siteConfig.name} Help — How it works`}>
          <article className="prose">
            <h2 id="start">Getting started</h2>
            <p>
              {siteConfig.name} launches a token on the {siteConfig.chain} and
              attaches an agent to it. The agent has its own wallet, collects
              the creator fees the token earns, and decides every round what to
              do with them. You set it up once; after that it runs without you,
              and every decision is written somewhere anyone can read it.
            </p>
            <ol>
              <li>
                <strong>Connect the owner wallet.</strong> This is the only
                wallet that can pause the agent or change its settings later.
              </li>
              <li>
                <strong>Give the agent a wallet of its own.</strong> Generate a
                fresh one on the launch page or paste a dedicated key, then send
                it a little ETH for gas. Never hand it your main wallet — it
                signs transactions on its own, unattended.
              </li>
              <li>
                <strong>Describe the token.</strong> Name, ticker, image. Choose
                which jobs the agent may do, how often it wakes up, and where
                treasury money goes.
              </li>
              <li>
                <strong>Launch.</strong> One transaction creates the token and
                starts the agent. Its first round begins at the next interval.
              </li>
            </ol>

            <h2 id="jobs">What the agent does</h2>
            <p>
              Each job can be switched on or off per token. Claiming fees is the
              exception — an agent that cannot claim has nothing to work with,
              so it is always on.
            </p>
            {JOBS.map(([name, body]) => (
              <div key={name}>
                <h3>{name}</h3>
                <p>{body}</p>
              </div>
            ))}

            <h2 id="round">Inside a round</h2>
            <p>
              Rounds run on the interval you pick, anywhere from{" "}
              {siteConfig.roundMinutes[0]} minute to {siteConfig.roundMinutes[1]}
              . Every round is the same four beats.
            </p>
            <ol>
              <li>
                <strong>Claim.</strong> Fees come out of escrow. If you set a
                treasury split, its share leaves immediately.
              </li>
              <li>
                <strong>Look.</strong> It reads its ETH and token balances,
                holder count, market cap, and its own past rounds.
              </li>
              <li>
                <strong>Decide.</strong> It picks exactly one action — or holds,
                which is a decision it has to justify like any other.
              </li>
              <li>
                <strong>Act and report.</strong> The action goes on-chain. The
                result, the reasoning and the transaction land in the activity
                log.
              </li>
            </ol>
            <p>
              <strong>Auto-pause.</strong> Five rounds with nothing to claim and
              the agent pauses itself rather than burn gas checking an empty
              balance. The owner can resume it from the token page.
            </p>

            <h2 id="curve">Curve and graduation</h2>
            <p>
              A new token opens on a bonding curve carrying a{" "}
              {siteConfig.curveFeePct}% trade fee. When the curve has taken{" "}
              {siteConfig.graduationEth} ETH the token graduates: liquidity
              moves into a pool and is locked. The agent works out that this has
              happened on its own and routes its buybacks to the pool from then
              on.
            </p>

            <h2 id="treasury">Treasury and fees</h2>
            <ul>
              <li>
                <strong>Treasury split.</strong> Any share from 0 to 100% of
                each claim, sent to the wallet you name.
              </li>
              <li>
                <strong>Platform fee.</strong> Up to 1%, if the operator has
                switched it on.
              </li>
              <li>
                <strong>Remainder.</strong> Stays with the agent, to buy back
                and burn with.
              </li>
              <li>
                <strong>Dust.</strong> Transfers too small to cover their own
                gas are skipped rather than sent at a loss.
              </li>
              <li>
                <strong>Fallback.</strong> If a split transfer fails, everything
                stays with the agent. Nothing is stranded.
              </li>
            </ul>

            <h2 id="api">API reference</h2>
            <p>
              The backend serves REST on port 8000, plus a WebSocket at{" "}
              <code>/ws</code> that streams every executed action as it lands.
            </p>
            <div className="overflow-x-auto">
              <table className="table min-w-[520px]">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Method</th>
                    <th style={{ width: 230 }}>Endpoint</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map(([method, path, description]) => (
                    <tr key={path + method}>
                      <td>
                        <span className="pill">{method}</span>
                      </td>
                      <td>
                        <code>{path}</code>
                      </td>
                      <td>{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mono mt-4 text-[11px] text-[var(--ink-muted)]">
              This build ships the front end only. No backend is wired up, so
              the endpoints above describe the shape the UI expects rather than
              a service you can call today.
            </p>

            <p className="mt-6">
              <Link href="/launch" className="btn btn-go">
                Launch a token
              </Link>
            </p>
          </article>
        </Window>
      </div>
    </div>
  );
}
