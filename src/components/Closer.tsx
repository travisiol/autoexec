"use client";

import Link from "next/link";
import { Balloon } from "./Balloon";
import { wordPaint } from "@/lib/glyphs";

export function Closer() {
  return (
    <section className="shell mt-24 mb-10 text-center">
      <Link
        href="/launch"
        className="relative balloon-shadow mx-auto block w-full max-w-[680px]"
        aria-label="Launch a token"
      >
        <Balloon
          paint={wordPaint("LAUNCH")}
          aspect={3}
          label="Launch a token"
          className="h-[110px] w-full sm:h-[150px]"
          inflate={0.31}
          bulge={1.1}
          sway={12}
        />
      </Link>
      <p className="lede mx-auto mt-3">
        One transaction. After that it does not need you again — though you keep
        the only key that can pause it.
      </p>
    </section>
  );
}
