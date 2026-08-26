"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { RIYAZ_TYPES, deleteSession, type RiyazSession } from "@/lib/apiClient";

const typeLabel = new Map(RIYAZ_TYPES.map((t) => [t.value, t.label]));

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function SessionList({ sessions }: { sessions: RiyazSession[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(session: RiyazSession) {
    if (!window.confirm(`Delete this ${session.raag.name} session from ${formatDate(session.practiceDate)}?`)) {
      return;
    }
    setDeletingId(session.id);
    try {
      await deleteSession(session.id);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  }

  if (sessions.length === 0) {
    return <p className="ef-caption">No sessions logged yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {sessions.map((session) => (
        <li key={session.id} className="ef-card flex items-center justify-between gap-4">
          <div>
            <p className="ef-subhead">{session.raag.name}</p>
            <p className="ef-caption">
              {formatDate(session.practiceDate)}
              {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {session.types.length > 0 && (
              <div className="flex flex-wrap justify-end gap-1">
                {session.types.map((t) => (
                  <span key={t} className="ef-badge ef-badge-neutral">
                    {typeLabel.get(t) ?? t}
                  </span>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => handleDelete(session)}
              disabled={deletingId === session.id}
              aria-label="Delete session"
              className="rounded-[var(--radius-button)] p-2 text-[var(--neutral-400)] transition hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] disabled:opacity-50"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
