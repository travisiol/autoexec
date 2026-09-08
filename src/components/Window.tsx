import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Adds the focused-window glow. Use on one window per screen at most. */
  focused?: boolean;
  /** Optional control rendered on the left of the title, e.g. a step counter. */
  icon?: ReactNode;
};

/**
 * A window. The caption buttons are decoration — this is a web page, and a
 * close button that actually closed the section would be a joke that costs
 * the reader the content. They are marked aria-hidden so a screen reader
 * doesn't announce three controls that do nothing.
 */
export function Window({
  title,
  children,
  className,
  bodyClassName,
  focused,
  icon,
}: Props) {
  return (
    <section className={clsx("win", focused && "win-focus", className)}>
      <header className="win-bar">
        {icon ?? <span className="start-orb" style={{ width: 16, height: 16 }} />}
        <span className="win-title">{title}</span>
        <span className="win-caption" aria-hidden="true">
          <span className="cap">–</span>
          <span className="cap">▢</span>
          <span className="cap cap-close">✕</span>
        </span>
      </header>
      <div className={clsx("win-body", bodyClassName)}>{children}</div>
    </section>
  );
}
