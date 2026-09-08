"use client";

import { useState } from "react";
import { Window } from "./Window";

/**
 * The holder channel. Messages stay in this tab and go nowhere — there is no
 * backend behind this build — so the panel says so instead of pretending a
 * message reached an agent.
 */
export function TokenChat({ ticker }: { ticker: string }) {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  return (
    <Window title={`chat.exe — holders of $${ticker}`}>
      <ol className="m-0 max-h-[220px] list-none overflow-y-auto p-0">
        {sent.length === 0 ? (
          <li className="text-[13px] text-[var(--ink-muted)]">
            Nothing here yet. What holders write is read at the start of the
            next round and weighed against everything else the agent knows — it
            is an argument, not an order.
          </li>
        ) : (
          sent.map((message, i) => (
            <li
              key={i}
              className="mb-2 rounded-[12px] border border-[var(--line)] bg-white px-3 py-2 text-[13px]"
            >
              {message}
            </li>
          ))
        )}
      </ol>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const message = draft.trim();
          if (!message) return;
          setSent((current) => [...current, message]);
          setDraft("");
        }}
      >
        <input
          className="field"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Make your case…"
          maxLength={280}
        />
        <button type="submit" className="btn" disabled={!draft.trim()}>
          Send
        </button>
      </form>
      <p className="mono mt-2 text-[11px] text-[var(--ink-muted)]">
        Local to this tab. No agent is listening in this build.
      </p>
    </Window>
  );
}
