import Link from "next/link";
import { tokens, formatPrice } from "@/lib/tokens";

/**
 * The strip across the top of the desktop. The list is duplicated so the
 * CSS marquee can translate exactly -50% and loop without a visible seam.
 */
export function Ticker() {
  const row = tokens.map((token) => {
    // Deterministic pseudo-delta from the address, so the strip has movement
    // in it without inventing a price feed that does not exist.
    const seed = parseInt(token.address.slice(-3), 16);
    const delta = ((seed % 41) - 18) / 2;
    return { token, delta };
  });

  return (
    <div className="ticker" aria-label="Token ticker">
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-6" aria-hidden={copy === 1}>
            {row.map(({ token, delta }) => (
              <Link
                key={token.address}
                href={`/coins/${token.address}`}
                className="ticker-item"
              >
                <b>${token.ticker}</b>
                <span className="mono">{formatPrice(token.priceEth)}</span>
                <span className={delta >= 0 ? "up" : "down"}>
                  {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
