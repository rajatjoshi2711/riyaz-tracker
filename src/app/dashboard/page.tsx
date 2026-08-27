import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";
import { getUser, getUserStreak, getUserCalendar, getUserSessions, getTopPracticedRaags } from "@/lib/data";
import DashboardClient from "@/app/dashboard/DashboardClient";

export default async function DashboardPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) redirect("/login");

  const user = await getUser(payload.userId);
  if (!user) redirect("/login");

  const [streak, calendar, sessionsResult, topRaags] = await Promise.all([
    getUserStreak(user.id),
    getUserCalendar(user.id),
    getUserSessions(user.id, 1, 5),
    getTopPracticedRaags(10),
  ]);

  return (
    <DashboardClient
      userName={user.name}
      streak={streak}
      days={calendar.days}
      recentSessions={sessionsResult.sessions}
      topRaags={topRaags}
    />
  );
}
