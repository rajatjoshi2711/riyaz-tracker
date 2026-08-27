"use client";

import { useRouter } from "next/navigation";
import { logout, type CalendarDay, type RiyazSession, type StreakResult, type TopRaag } from "@/lib/apiClient";
import StreakCard from "@/components/StreakCard";
import SessionForm from "@/components/SessionForm";
import ContributionBoard from "@/components/ContributionBoard";
import SessionList from "@/components/SessionList";
import TopRaagsBeeswarm from "@/components/TopRaagsBeeswarm";
import NavMenu from "@/components/NavMenu";

type Props = {
  userName: string;
  userRole: "ADMIN" | "USER";
  streak: StreakResult;
  days: CalendarDay[];
  recentSessions: RiyazSession[];
  topRaags: TopRaag[];
};

export default function DashboardClient({ userName, userRole, streak, days, recentSessions, topRaags }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <main className="ef-container-product flex w-full min-w-0 flex-col gap-6 py-12">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="ef-eyebrow mb-1">Riyaz tracker</p>
          <h1 className="ef-page truncate">Welcome back, {userName.split(" ")[0]}</h1>
        </div>
        <NavMenu
          items={[
            ...(userRole === "ADMIN" ? [{ label: "Admin", href: "/admin/users" }] : []),
            { label: "Find friends", href: "/friends" },
            { label: "View history", href: "/history" },
            { label: "Sign out", onClick: handleLogout },
          ]}
        />
      </div>

      <StreakCard streak={streak} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SessionForm onLogged={() => router.refresh()} />
        <ContributionBoard days={days} />
      </div>

      <div className="ef-card">
        <p className="ef-subhead mb-1">Your most practiced raags</p>
        <p className="ef-caption mb-4">Based on your own logged sessions</p>
        <TopRaagsBeeswarm raags={topRaags} />
      </div>

      <div>
        <p className="ef-subhead mb-3">Recent sessions</p>
        <SessionList sessions={recentSessions} />
      </div>
    </main>
  );
}
