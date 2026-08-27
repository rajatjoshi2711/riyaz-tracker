"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

export default function FindFriendsBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="ef-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      style={{ background: "var(--grad-brand-soft)", borderColor: "var(--blue-200)" }}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Sparkles size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--blue-500)]" />
        <div>
          <p className="ef-subhead">New: Find friends</p>
          <p className="ef-caption">
            Follow other players and see their practice updates show up in your timeline.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
        <Link href="/friends" className="ef-btn ef-btn-primary">
          Try it
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="rounded-[var(--radius-button)] p-2 text-[var(--neutral-500)] transition hover:bg-[var(--blue-100)] hover:text-[var(--text-primary)]"
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
