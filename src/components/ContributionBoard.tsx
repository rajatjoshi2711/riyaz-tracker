"use client";

import { useEffect, useRef, useState } from "react";
import type { CalendarDay } from "@/lib/apiClient";

const CELL_SIZE = 12; // px, matches h-3 w-3
const GAP = 4; // px, matches gap-1

function levelColor(day: CalendarDay) {
  if (!day.practiced) return "var(--neutral-100)";
  if (day.sessionCount >= 3) return "var(--green-600)";
  if (day.sessionCount === 2) return "var(--green-400)";
  return "var(--green-200)";
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function ContributionBoard({ days }: { days: CalendarDay[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleWeeks, setVisibleWeeks] = useState(53);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function update(width: number) {
      setVisibleWeeks(Math.max(1, Math.floor((width + GAP) / (CELL_SIZE + GAP))));
    }

    update(el.clientWidth);
    const observer = new ResizeObserver((entries) => update(entries[0].contentRect.width));
    observer.observe(el);
    const onWindowResize = () => update(el.clientWidth);
    window.addEventListener("resize", onWindowResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  if (days.length === 0) return null;

  const firstDayOfWeek = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const padded: (CalendarDay | null)[] = [...Array(firstDayOfWeek).fill(null), ...days];

  const allWeeks: (CalendarDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    allWeeks.push(padded.slice(i, i + 7));
  }
  const weeks = allWeeks.slice(-visibleWeeks);

  return (
    <div className="ef-card">
      <p className="ef-subhead mb-4">Practice history</p>
      <div ref={containerRef} className="flex gap-1 overflow-hidden pb-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) =>
              day ? (
                <div
                  key={day.date}
                  title={`${formatDate(day.date)} — ${
                    day.practiced
                      ? `${day.sessionCount} session${day.sessionCount === 1 ? "" : "s"}${
                          day.totalMinutes ? `, ${day.totalMinutes} min` : ""
                        }`
                      : "No practice"
                  }`}
                  className="h-3 w-3 rounded-[2px]"
                  style={{ backgroundColor: levelColor(day) }}
                />
              ) : (
                <div key={`pad-${weekIndex}-${dayIndex}`} className="h-3 w-3" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="ef-caption mt-3 flex items-center gap-2">
        <span>Less</span>
        <div className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: "var(--neutral-100)" }} />
        <div className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: "var(--green-200)" }} />
        <div className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: "var(--green-400)" }} />
        <div className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: "var(--green-600)" }} />
        <span>More</span>
      </div>
    </div>
  );
}
