"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig, shortAddress } from "@/lib/site-config";
import { MARK_PATH } from "@/lib/glyphs";

const NAV = [
  { href: "/", label: "Tokens" },
  { href: "/launch", label: "Launch a token" },
  { href: "/docs", label: "How it works" },
];

export function StartOrb({ size = 28 }: { size?: number }) {
  return (
    <span className="start-orb" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size * 0.6}
        height={size * 0.6}
        aria-hidden="true"
      >
        <path
          d={MARK_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Clock in the tray. Rendered empty on the server so the markup matches. */
function Clock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="mono" style={{ minWidth: 42, textAlign: "right" }}>
      {time ?? "--:--"}
    </span>
  );
}

export function Taskbar() {
  const pathname = usePathname();

  return (
    <footer className="taskbar">
      <Link href="/" className="start" aria-label={`${siteConfig.name} home`}>
        <StartOrb />
        <span className="hidden sm:inline">{siteConfig.name}</span>
      </Link>

      <nav className="flex gap-1.5 overflow-hidden" aria-label="Main">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="task-btn"
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <StartOrb size={15} />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="tray">
        <span className="tray-chip hidden lg:inline-flex mono">
          {siteConfig.contract
            ? `CA: ${shortAddress(siteConfig.contract)}`
            : "CA: not deployed"}
        </span>
        <a
          href={siteConfig.x}
          target="_blank"
          rel="noreferrer noopener"
          className="tray-chip"
        >
          <span aria-hidden="true">𝕏</span>
          <span className="hidden sm:inline">Follow</span>
        </a>
        <span className="tray-chip">
          <span className="led" />
          <span className="hidden md:inline">Agents online</span>
        </span>
        <Clock />
      </div>
    </footer>
  );
}
