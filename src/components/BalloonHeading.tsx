"use client";

import { Balloon } from "./Balloon";
import { wordPaint } from "@/lib/glyphs";

/**
 * A section heading rendered as an inflated object rather than as type.
 *
 * The real heading is an h2 in the accessible tree; the balloon carries the
 * same string as its label. Screen readers and search engines get the words,
 * everyone else gets the object.
 */
export function BalloonHeading({
  text,
  label,
  maxWidth = 560,
  height = 100,
  color,
}: {
  text: string;
  label: string;
  maxWidth?: number;
  height?: number;
  color?: string;
}) {
  // Wider words need a wider mask, or the renderer squeezes them to fit the
  // box and the tubes come out thin.
  const aspect = Math.max(2.2, text.length / 2.4);

  return (
    <h2 className="relative m-0">
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="relative balloon-shadow mx-auto block w-full"
        style={{ maxWidth }}
      >
        <Balloon
          paint={wordPaint(text)}
          aspect={aspect}
          label={label}
          color={color}
          className="w-full"
          style={{ height: `clamp(${Math.round(height * 0.62)}px, 12vw, ${height}px)` }}
          inflate={0.28}
        />
      </span>
    </h2>
  );
}
