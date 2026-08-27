import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";
import { getUser, getUserStreak, getUserCalendar, getTopPracticedRaags, isFollowing } from "@/lib/data";
import StreakCard from "@/components/StreakCard";
import ContributionBoard from "@/components/ContributionBoard";
import TopRaagsBeeswarm from "@/components/TopRaagsBeeswarm";
import ProfileFollowButton from "@/app/profile/[userId]/ProfileFollowButton";

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) redirect("/login");

  const { userId } = await params;
  if (userId === payload.userId) redirect("/dashboard");

  const profileUser = await getUser(userId);
  if (!profileUser) notFound();

  const [streak, calendar, topRaags, following] = await Promise.all([
    getUserStreak(userId),
    getUserCalendar(userId),
    getTopPracticedRaags(userId, 10),
    isFollowing(payload.userId, userId),
  ]);

  const firstName = profileUser.name.split(" ")[0];

  return (
    <main className="ef-container-product flex w-full min-w-0 flex-col gap-6 py-12">
      <div>
        <Link href="/friends" className="ef-btn-text inline-flex items-center gap-1">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Find friends
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="ef-eyebrow mb-1">Riyaz tracker</p>
          <h1 className="ef-page break-words">{profileUser.name}</h1>
        </div>
        <ProfileFollowButton userId={userId} initialFollowing={following} />
      </div>

      <StreakCard streak={streak} />

      <ContributionBoard days={calendar.days} />

      <div className="ef-card">
        <p className="ef-subhead mb-1">Most practiced raags</p>
        <p className="ef-caption mb-4">{firstName}&apos;s top raags</p>
        <TopRaagsBeeswarm raags={topRaags} />
      </div>
    </main>
  );
}
