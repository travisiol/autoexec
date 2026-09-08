/**
 * Every string that carries the brand lives here. Renaming the project is a
 * one-file edit: nothing else in src/ hardcodes the name, the ticker or the
 * handle.
 */
export const siteConfig = {
  name: "AUTOEXEC",
  /** Shown wherever the ticker appears, always prefixed with $ in the UI. */
  ticker: "AUTOEXEC",
  tagline: "Launchpad for tokenized agents",
  url: "https://autoexec.fun",
  seoDescription:
    "AUTOEXEC launches a token and gives it an agent. The agent collects the creator fees the token earns, then buys back and burns supply on its own — and writes down every decision.",
  x: "https://x.com/autoexecfun",
  xHandle: "@autoexecfun",
  /**
   * No contract is deployed. The UI reads this as "unset" and says so rather
   * than printing a plausible-looking address nobody can check.
   */
  contract: "",
  launchpadBase: "https://www.ponsfamily.com/launchpad/",
  chain: "Robinhood Chain",
  /** Curve economics, quoted in a dozen places across the site. */
  graduationEth: 4.2,
  curveFeePct: 1,
  roundMinutes: [1, 60] as const,
} as const;

export const shortAddress = (address: string, head = 6, tail = 4) =>
  address.length <= head + tail
    ? address
    : `${address.slice(0, head)}…${address.slice(-tail)}`;
