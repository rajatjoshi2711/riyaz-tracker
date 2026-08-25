export type StreakResult = {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
};

export function toDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysBetween(laterDate: string, earlierDate: string) {
  const later = new Date(`${laterDate}T00:00:00Z`).getTime();
  const earlier = new Date(`${earlierDate}T00:00:00Z`).getTime();
  return Math.round((later - earlier) / 86_400_000);
}

/** practiceDates need not be unique or sorted; today defaults to the current UTC date. */
export function computeStreaks(practiceDates: Date[], today: Date = new Date()): StreakResult {
  if (practiceDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastPracticeDate: null };
  }

  const uniqueDatesDesc = Array.from(new Set(practiceDates.map(toDateOnly))).sort((a, b) =>
    a < b ? 1 : a > b ? -1 : 0,
  );

  const todayStr = toDateOnly(today);
  const yesterdayStr = toDateOnly(new Date(today.getTime() - 86_400_000));

  let currentStreak = 0;
  if (uniqueDatesDesc[0] === todayStr || uniqueDatesDesc[0] === yesterdayStr) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDatesDesc.length; i++) {
      if (daysBetween(uniqueDatesDesc[i - 1], uniqueDatesDesc[i]) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < uniqueDatesDesc.length; i++) {
    run = daysBetween(uniqueDatesDesc[i - 1], uniqueDatesDesc[i]) === 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }

  return { currentStreak, longestStreak, lastPracticeDate: uniqueDatesDesc[0] };
}
