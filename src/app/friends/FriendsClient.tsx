"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flame, Heart, UserPlus, UserCheck } from "lucide-react";
import {
  followUser,
  unfollowUser,
  likeTimelineItem,
  unlikeTimelineItem,
  getTimeline,
  RIYAZ_TYPES,
  type FriendUser,
  type TimelineItem,
} from "@/lib/apiClient";

const typeLabel = new Map(RIYAZ_TYPES.map((t) => [t.value, t.label]));
const TIMELINE_POLL_MS = 20_000;

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak <= 0) return null;
  return (
    <span
      className="ef-caption inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
      style={{ backgroundColor: "var(--warning-soft)", color: "#9a6c0c" }}
      title={`${streak} day streak`}
    >
      <Flame size={12} strokeWidth={2} />
      {streak}
    </span>
  );
}

function FollowButton({
  following,
  onToggle,
  pending,
}: {
  following: boolean;
  onToggle: () => void;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      className={`ef-btn ${following ? "ef-btn-secondary" : "ef-btn-primary"} inline-flex items-center gap-1.5 disabled:opacity-60`}
    >
      {following ? <UserCheck size={14} strokeWidth={1.75} /> : <UserPlus size={14} strokeWidth={1.75} />}
      {following ? "Following" : "Follow"}
    </button>
  );
}

export default function FriendsClient({
  initialUsers,
  initialTimeline,
}: {
  initialUsers: FriendUser[];
  initialTimeline: TimelineItem[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [pendingFollow, setPendingFollow] = useState<string | null>(null);
  const [pendingLike, setPendingLike] = useState<string | null>(null);
  const pendingLikeRef = useRef<string | null>(null);
  useEffect(() => {
    pendingLikeRef.current = pendingLike;
  }, [pendingLike]);

  useEffect(() => {
    const timer = setInterval(async () => {
      // Skip this tick if a like/unlike is in flight — polling now could
      // overwrite the optimistic update with data from before it landed.
      if (pendingLikeRef.current) return;
      try {
        const { items } = await getTimeline();
        setTimeline(items);
      } catch {
        // silent — next poll will retry
      }
    }, TIMELINE_POLL_MS);
    return () => clearInterval(timer);
  }, []);

  async function handleToggleFollow(user: FriendUser) {
    setPendingFollow(user.id);
    const nextFollowing = !user.isFollowing;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isFollowing: nextFollowing } : u)));
    try {
      if (nextFollowing) {
        await followUser(user.id);
      } else {
        await unfollowUser(user.id);
        setTimeline((prev) => prev.filter((item) => item.user.id !== user.id));
      }
      const { items } = await getTimeline();
      setTimeline(items);
    } catch (err) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isFollowing: user.isFollowing } : u)));
      window.alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPendingFollow(null);
    }
  }

  async function handleToggleLike(item: TimelineItem) {
    setPendingLike(item.id);
    const nextLiked = !item.likedByMe;
    setTimeline((prev) =>
      prev.map((t) =>
        t.id === item.id
          ? { ...t, likedByMe: nextLiked, likeCount: t.likeCount + (nextLiked ? 1 : -1) }
          : t,
      ),
    );
    try {
      if (nextLiked) {
        await likeTimelineItem(item.id);
      } else {
        await unlikeTimelineItem(item.id);
      }
    } catch (err) {
      setTimeline((prev) => prev.map((t) => (t.id === item.id ? item : t)));
      window.alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPendingLike(null);
    }
  }

  const recommendations = users.filter((u) => !u.isFollowing);

  return (
    <main className="ef-container-product flex w-full min-w-0 flex-col gap-6 py-12">
      <div>
        <Link href="/dashboard" className="ef-btn-text inline-flex items-center gap-1">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to dashboard
        </Link>
      </div>

      <div>
        <p className="ef-eyebrow mb-1">Riyaz tracker</p>
        <h1 className="ef-page">Find friends</h1>
      </div>

      <div>
        <p className="ef-subhead mb-3">Suggested for you</p>
        {recommendations.length === 0 ? (
          <p className="ef-caption">
            {users.length === 0 ? "No one else has joined yet." : "You're following everyone — nice!"}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recommendations.map((u) => (
              <div key={u.id} className="ef-card flex flex-col gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="ef-subhead truncate">{u.name}</p>
                    <StreakBadge streak={u.currentStreak} />
                  </div>
                  <p className="ef-caption truncate">
                    {u.sessionCount} session{u.sessionCount === 1 ? "" : "s"} logged
                  </p>
                </div>
                <FollowButton
                  following={u.isFollowing}
                  pending={pendingFollow === u.id}
                  onToggle={() => handleToggleFollow(u)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="ef-subhead mb-3">Timeline</p>
        {timeline.length === 0 ? (
          <p className="ef-caption">
            {users.some((u) => u.isFollowing)
              ? "The people you follow haven't logged a session yet."
              : "Follow someone above to see their practice updates here."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {timeline.map((item) => (
              <li key={item.id} className="ef-card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="ef-body flex flex-wrap items-center gap-2">
                      <span>
                        <span className="font-semibold">{item.user.name}</span> practiced{" "}
                        <span className="font-semibold">{item.raag.name}</span>
                      </span>
                      <StreakBadge streak={item.user.currentStreak} />
                    </p>
                    <p className="ef-caption">
                      {formatDate(item.practiceDate)}
                      {item.durationMinutes ? ` · ${item.durationMinutes} min` : ""} · {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  {item.types.length > 0 && (
                    <div className="flex shrink-0 flex-wrap justify-end gap-1">
                      {item.types.map((t) => (
                        <span key={t} className="ef-badge ef-badge-neutral">
                          {typeLabel.get(t) ?? t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleLike(item)}
                  disabled={pendingLike === item.id}
                  className={`ef-small inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 transition disabled:opacity-60 ${
                    item.likedByMe ? "text-[var(--danger)]" : "text-[var(--neutral-400)] hover:text-[var(--danger)]"
                  }`}
                >
                  <Heart size={16} strokeWidth={1.75} fill={item.likedByMe ? "currentColor" : "none"} />
                  {item.likeCount > 0 ? item.likeCount : "Like"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
