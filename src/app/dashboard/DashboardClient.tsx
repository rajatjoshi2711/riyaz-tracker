"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, type CalendarDay, type RiyazSession, type StreakResult } from "@/lib/apiClient";
import StreakCard from "@/components/StreakCard";
import SessionForm from "@/components/SessionForm";
import ContributionBoard from "@/components/ContributionBoard";
import SessionList from "@/components/SessionList";

type Props = {
  userName: string;
  streak: StreakResult;
  days: CalendarDay[];
  recentSessions: RiyazSession[];
};

export default function DashboardClient({ userName, streak, days, recentSessions }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <main className="ef-container-product flex flex-col gap-6 py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="ef-eyebrow mb-1">Riyaz tracker</p>
          <h1 className="ef-page break-words">Welcome back, {userName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/history" className="ef-btn ef-btn-secondary">
            View history
          </Link>
          <button className="ef-btn ef-btn-text" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>

      <StreakCard streak={streak} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SessionForm onLogged={() => router.refresh()} />
        <ContributionBoard days={days} />
      </div>

      <div>
        <p className="ef-subhead mb-3">Recent sessions</p>
        <SessionList sessions={recentSessions} />
      </div>
    </main>
  );
}
