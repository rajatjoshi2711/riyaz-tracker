import { Flame, Trophy } from "lucide-react";
import type { StreakResult } from "@/lib/apiClient";

export default function StreakCard({ streak }: { streak: StreakResult }) {
  return (
    <div className="ef-card-stat flex items-center justify-between">
      <div>
        <p className="ef-small text-white/80">Current streak</p>
        <div className="flex items-center gap-2">
          <Flame size={28} strokeWidth={1.5} />
          <span className="ef-stat-number">{streak.currentStreak}</span>
          <span className="ef-body text-white/80">
            {streak.currentStreak === 1 ? "day" : "days"}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="ef-small text-white/80">Longest streak</p>
        <div className="flex items-center justify-end gap-2">
          <Trophy size={20} strokeWidth={1.5} />
          <span className="ef-h3">{streak.longestStreak}</span>
        </div>
      </div>
    </div>
  );
}
