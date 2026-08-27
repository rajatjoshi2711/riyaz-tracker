import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";
import { getUsersForFriends, getFollowingTimeline } from "@/lib/data";
import FriendsClient from "@/app/friends/FriendsClient";

export default async function FriendsPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) redirect("/login");

  const [users, timeline] = await Promise.all([
    getUsersForFriends(payload.userId),
    getFollowingTimeline(payload.userId, 30),
  ]);

  return (
    <FriendsClient
      initialUsers={users}
      initialTimeline={timeline.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))}
    />
  );
}
