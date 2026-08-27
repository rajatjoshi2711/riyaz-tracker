"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserPlus } from "lucide-react";
import { followUser, unfollowUser } from "@/lib/apiClient";

export default function ProfileFollowButton({
  userId,
  initialFollowing,
}: {
  userId: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    const next = !following;
    setFollowing(next);
    try {
      if (next) {
        await followUser(userId);
      } else {
        await unfollowUser(userId);
      }
      router.refresh();
    } catch (err) {
      setFollowing(!next);
      window.alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className={`ef-btn ${following ? "ef-btn-secondary" : "ef-btn-primary"} inline-flex shrink-0 items-center gap-1.5 disabled:opacity-60`}
    >
      {following ? <UserCheck size={14} strokeWidth={1.75} /> : <UserPlus size={14} strokeWidth={1.75} />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
