import { RIYAZ_TYPES, type RiyazSession } from "@/lib/apiClient";

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
          {session.types.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1">
              {session.types.map((t) => (
                <span key={t} className="ef-badge ef-badge-neutral">
                  {typeLabel.get(t) ?? t}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
