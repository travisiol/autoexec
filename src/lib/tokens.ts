import { siteConfig } from "./site-config";

/**
 * Sample tokens.
 *
 * Nothing here is on a chain. There is no indexer behind this build, so the
 * explorer reads from a fixed list and every screen that shows a number also
 * says where the number came from. The addresses are deliberately obvious
 * placeholders (0x0000…) rather than plausible-looking hex, so nobody can mistake
 * one for something they could paste into a wallet.
 */

export type AgentAction =
  | "claim"
  | "buyback"
  | "burn"
  | "treasury"
  | "hold"
  | "note";

export type ActionEntry = {
  round: number;
  action: AgentAction;
  amount: string;
  reasoning: string;
  minutesAgo: number;
};

export type Token = {
  address: string;
  name: string;
  ticker: string;
  blurb: string;
  /** "curve" until it reaches the graduation target, then "pool". */
  stage: "curve" | "pool";
  status: "running" | "paused";
  /** ETH raised on the curve so far. */
  raised: number;
  priceEth: number | null;
  marketCapEth: number | null;
  burned: string;
  boughtBackEth: number;
  round: number;
  intervalMinutes: number;
  holders: number;
  treasurySplit: number;
  jobs: AgentAction[];
  hue: number;
  history: ActionEntry[];
};

export const GRADUATION_ETH = siteConfig.graduationEth;

export const tokens: Token[] = [
  {
    address: "0x0000000000000000000000000000000000000a01",
    name: siteConfig.name,
    ticker: siteConfig.ticker,
    blurb: "The first process. It funds itself and reports to nobody.",
    stage: "pool",
    status: "running",
    raised: GRADUATION_ETH,
    priceEth: 0.0000041,
    marketCapEth: 4.1,
    burned: "25.2M",
    boughtBackEth: 0.075,
    round: 28,
    intervalMinutes: 15,
    holders: 412,
    treasurySplit: 20,
    jobs: ["claim", "buyback", "burn", "treasury", "note"],
    hue: 96,
    history: [
      {
        round: 28,
        action: "burn",
        amount: "1.84M " + siteConfig.ticker,
        reasoning:
          "Held more tokens than the last three rounds combined and the pool was thin. Burning now costs one transaction and takes the supply down permanently.",
        minutesAgo: 4,
      },
      {
        round: 27,
        action: "buyback",
        amount: "0.0180 ETH",
        reasoning:
          "Price sat below the round-20 average with fees still arriving. Spent into the pool rather than sitting on idle ETH.",
        minutesAgo: 19,
      },
      {
        round: 26,
        action: "claim",
        amount: "0.0224 ETH",
        reasoning:
          "Escrow held more than eight times the gas quote, so claiming cleared easily.",
        minutesAgo: 34,
      },
      {
        round: 25,
        action: "hold",
        amount: "—",
        reasoning:
          "Two buybacks in a row already. Holding one round so the next one lands on a fuller balance.",
        minutesAgo: 49,
      },
      {
        round: 24,
        action: "treasury",
        amount: "0.0048 ETH",
        reasoning: "Routine 20% split on the round's claim.",
        minutesAgo: 64,
      },
    ],
  },
  {
    address: "0x0000000000000000000000000000000000000b02",
    name: "Nightshift",
    ticker: "NIGHT",
    blurb: "Runs hourly, burns everything, never speaks.",
    stage: "curve",
    status: "running",
    raised: 2.64,
    priceEth: 0.0000009,
    marketCapEth: 0.9,
    burned: "8.10M",
    boughtBackEth: 0.0312,
    round: 61,
    intervalMinutes: 60,
    holders: 148,
    treasurySplit: 0,
    jobs: ["claim", "buyback", "burn"],
    hue: 168,
    history: [
      {
        round: 61,
        action: "buyback",
        amount: "0.0041 ETH",
        reasoning:
          "Curve is 63% of the way to graduation. Buying on the curve moves it closer and picks up cheaper supply than the pool will offer later.",
        minutesAgo: 12,
      },
      {
        round: 60,
        action: "claim",
        amount: "0.0053 ETH",
        reasoning: "Hourly claim. Escrow comfortably above the gas floor.",
        minutesAgo: 72,
      },
    ],
  },
  {
    address: "0x0000000000000000000000000000000000000c03",
    name: "Ledgerbeast",
    ticker: "BEAST",
    blurb: "Half of every claim goes to the treasury. Loud about it.",
    stage: "curve",
    status: "running",
    raised: 1.18,
    priceEth: 0.0000004,
    marketCapEth: 0.4,
    burned: "2.44M",
    boughtBackEth: 0.0089,
    round: 17,
    intervalMinutes: 5,
    holders: 63,
    treasurySplit: 50,
    jobs: ["claim", "buyback", "burn", "treasury", "note", "chat" as AgentAction],
    hue: 42,
    history: [
      {
        round: 17,
        action: "treasury",
        amount: "0.0021 ETH",
        reasoning:
          "Half the claim goes out by configuration. Holders asked for a listing budget and this is where it comes from.",
        minutesAgo: 3,
      },
      {
        round: 16,
        action: "claim",
        amount: "0.0042 ETH",
        reasoning: "Five-minute interval, escrow above the gas floor.",
        minutesAgo: 8,
      },
    ],
  },
  {
    address: "0x0000000000000000000000000000000000000d04",
    name: "Coldstart",
    ticker: "COLD",
    blurb: "Paused itself after five empty rounds. Waiting on its owner.",
    stage: "curve",
    status: "paused",
    raised: 0.09,
    priceEth: null,
    marketCapEth: null,
    burned: "0",
    boughtBackEth: 0,
    round: 6,
    intervalMinutes: 10,
    holders: 4,
    treasurySplit: 10,
    jobs: ["claim", "buyback"],
    hue: 200,
    history: [
      {
        round: 6,
        action: "note",
        amount: "—",
        reasoning:
          "Fifth round in a row with nothing in escrow. Pausing so gas is not spent checking an empty balance every ten minutes.",
        minutesAgo: 240,
      },
    ],
  },
];

export const findToken = (address: string) =>
  tokens.find((t) => t.address.toLowerCase() === address.toLowerCase());

export const actionLabels: Record<string, { label: string; exe: string }> = {
  claim: { label: "Claimed fees", exe: "claim_fees.exe" },
  buyback: { label: "Bought back", exe: "buyback.exe" },
  burn: { label: "Burned supply", exe: "burn.exe" },
  treasury: { label: "Funded treasury", exe: "treasury.exe" },
  hold: { label: "Held", exe: "decide.exe" },
  note: { label: "Wrote a note", exe: "memory.exe" },
  chat: { label: "Read holder messages", exe: "chat.exe" },
};

export const formatEth = (value: number | null, digits = 4) =>
  value === null ? "—" : `${value.toFixed(digits)} ETH`;

export const formatPrice = (value: number | null) =>
  value === null ? "—" : `${value.toFixed(7)} ETH`;

export const curvePercent = (token: Token) =>
  token.stage === "pool"
    ? 100
    : Math.min(100, Math.round((token.raised / GRADUATION_ETH) * 100));
