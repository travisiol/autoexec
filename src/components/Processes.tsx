import { Window } from "./Window";
import { Reveal } from "./Reveal";
import { BalloonHeading } from "./BalloonHeading";

/**
 * The six jobs an agent can do, shown as a task manager. Each row carries a
 * fake-but-honest CPU figure: it is a fixed number describing how much of a
 * round that job typically costs, not a live reading, and the window says so.
 */
const PROCESSES = [
  {
    exe: "claim_fees.exe",
    title: "Claims your fees",
    body: "Pulls creator fees out of escrow at the top of every round. If they are worth less than the gas to move them, it leaves them there and tries again next time.",
    load: 4,
    always: true,
  },
  {
    exe: "buyback.exe",
    title: "Buys its own token",
    body: "Spends ETH back into the token. Before graduation that lands on the curve; after graduation it lands in the pool. It works out which on its own.",
    load: 21,
  },
  {
    exe: "burn.exe",
    title: "Burns supply for real",
    body: "Destroys tokens it holds, so total supply actually falls. Nothing is parked at a dead address and counted as gone.",
    load: 9,
  },
  {
    exe: "treasury.exe",
    title: "Funds your treasury",
    body: "Sends the share you set to the wallet you name, every claim. The remainder stays with the agent to spend.",
    load: 6,
  },
  {
    exe: "memory.exe",
    title: "Remembers what it tried",
    body: "Writes each round down with its reasoning, and reads its own history back before it decides again.",
    load: 12,
  },
  {
    exe: "chat.exe",
    title: "Talks to your holders",
    body: "Holders can message it from the token page. What they say is weighed in the next round — it is an input, not an instruction.",
    load: 7,
  },
];

export function Processes() {
  return (
    <section className="shell mt-20">
      <BalloonHeading text="RUNS ITSELF" label="Runs itself" maxWidth={620} />
      <p className="lede mx-auto mt-2 text-center">
        Six processes, one loop. Every decision is written down where anyone can
        read it — including the rounds where it decided to do nothing.
      </p>

      <Reveal>
        <Window className="mt-4" title="Task Manager — Agent processes">
          <div className="overflow-x-auto">
            <table className="table min-w-[560px]">
              <thead>
                <tr>
                  <th style={{ width: "34%" }}>Process</th>
                  <th>What it does</th>
                  <th style={{ width: 92 }}>Round cost</th>
                  <th style={{ width: 96 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {PROCESSES.map((process) => (
                  <tr key={process.exe}>
                    <td>
                      <span className="display block text-[15px] text-[var(--ink)]">
                        {process.title}
                      </span>
                      <span className="mono text-[11px] text-[var(--ink-muted)]">
                        {process.exe}
                      </span>
                    </td>
                    <td>{process.body}</td>
                    <td>
                      <div className="bar" style={{ height: 10 }}>
                        <div
                          className="bar-fill"
                          style={{ width: `${process.load}%` }}
                        />
                      </div>
                      <span className="mono mt-1 block text-[10px] text-[var(--ink-muted)]">
                        {process.load}%
                      </span>
                    </td>
                    <td>
                      <span className="pill">
                        <span className="led" />
                        Running
                      </span>
                      {process.always && (
                        <span className="mono mt-1 block text-[10px] text-[var(--ink-muted)]">
                          always on
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mono mt-4 border-t border-[var(--line)] pt-3 text-[11px] text-[var(--ink-muted)]">
            Round cost is a typical share of one round&apos;s gas budget, not a
            live measurement. Every job except claiming can be switched off per
            token.
          </p>
        </Window>
      </Reveal>
    </section>
  );
}
