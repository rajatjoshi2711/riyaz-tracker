import { prisma } from "@/lib/db";
import { computeStreaks, toDateOnly } from "@/lib/streaks";
import type { RiyazType } from "@/generated/prisma/enums";

const DAY_MS = 86_400_000;
const DEFAULT_RANGE_DAYS = 365;

export function getUser(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export function incrementFindFriendsBannerViews(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { findFriendsBannerViews: { increment: 1 } },
  });
}

export function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getUserStreak(userId: string) {
  const sessions = await prisma.riyazSession.findMany({
    where: { userId },
    select: { practiceDate: true },
  });
  return computeStreaks(sessions.map((s) => s.practiceDate));
}

export async function getUserCalendar(userId: string, from?: string, to?: string) {
  const toStr = to ?? toDateOnly(new Date());
  const fromStr =
    from ??
    toDateOnly(new Date(Date.parse(`${toStr}T00:00:00Z`) - (DEFAULT_RANGE_DAYS - 1) * DAY_MS));

  const fromDate = new Date(`${fromStr}T00:00:00Z`);
  const toDate = new Date(`${toStr}T00:00:00Z`);

  const grouped = await prisma.riyazSession.groupBy({
    by: ["practiceDate"],
    where: { userId, practiceDate: { gte: fromDate, lte: toDate } },
    _count: { _all: true },
    _sum: { durationMinutes: true },
  });

  const byDate = new Map(
    grouped.map((g) => [
      toDateOnly(g.practiceDate),
      { sessionCount: g._count._all, totalMinutes: g._sum.durationMinutes ?? 0 },
    ]),
  );

  const days = [];
  for (let t = fromDate.getTime(); t <= toDate.getTime(); t += DAY_MS) {
    const date = toDateOnly(new Date(t));
    const activity = byDate.get(date);
    days.push({
      date,
      practiced: Boolean(activity),
      sessionCount: activity?.sessionCount ?? 0,
      totalMinutes: activity?.totalMinutes ?? 0,
    });
  }

  return { from: fromStr, to: toStr, days };
}

function serializeSession<T extends { practiceDate: Date }>(session: T) {
  return { ...session, practiceDate: toDateOnly(session.practiceDate) };
}

export async function getUserSessions(
  userId: string,
  page: number,
  pageSize: number,
  range?: { from?: string; to?: string },
) {
  const where = {
    userId,
    ...(range?.from || range?.to
      ? {
          practiceDate: {
            ...(range.from ? { gte: new Date(`${range.from}T00:00:00Z`) } : {}),
            ...(range.to ? { lte: new Date(`${range.to}T00:00:00Z`) } : {}),
          },
        }
      : {}),
  };

  const [sessions, total] = await Promise.all([
    prisma.riyazSession.findMany({
      where,
      orderBy: [{ practiceDate: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { raag: { select: { id: true, name: true } } },
    }),
    prisma.riyazSession.count({ where }),
  ]);
  return { sessions: sessions.map(serializeSession), total, page, pageSize };
}

export async function deleteRiyazSession(userId: string, sessionId: string) {
  const result = await prisma.riyazSession.deleteMany({
    where: { id: sessionId, userId },
  });
  return result.count > 0;
}

export async function getTopPracticedRaags(userId: string, limit = 10) {
  const grouped = await prisma.riyazSession.groupBy({
    by: ["raagId"],
    where: { userId },
    _count: { _all: true },
    orderBy: { _count: { raagId: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const raags = await prisma.raag.findMany({
    where: { id: { in: grouped.map((g) => g.raagId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(raags.map((r) => [r.id, r.name]));

  return grouped.map((g) => ({
    raagId: g.raagId,
    name: nameById.get(g.raagId) ?? "Unknown",
    count: g._count._all,
  }));
}

export function searchRaagsByName(search: string) {
  const normalized = search.trim().toLowerCase();
  return prisma.raag.findMany({
    where: normalized ? { normalizedName: { contains: normalized } } : undefined,
    orderBy: { name: "asc" },
    take: 20,
    select: { id: true, name: true },
  });
}

async function getCurrentStreaksForUsers(userIds: string[]) {
  const result = new Map<string, number>();
  if (userIds.length === 0) return result;

  const sessions = await prisma.riyazSession.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, practiceDate: true },
  });
  const datesByUser = new Map<string, Date[]>();
  for (const s of sessions) {
    const dates = datesByUser.get(s.userId) ?? [];
    dates.push(s.practiceDate);
    datesByUser.set(s.userId, dates);
  }
  for (const id of userIds) {
    result.set(id, computeStreaks(datesByUser.get(id) ?? []).currentStreak);
  }
  return result;
}

export async function getUsersForFriends(currentUserId: string) {
  const users = await prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: {
      id: true,
      name: true,
      email: true,
      _count: { select: { sessions: true } },
      followers: { where: { followerId: currentUserId }, select: { id: true } },
    },
    orderBy: { sessions: { _count: "desc" } },
  });

  const streaks = await getCurrentStreaksForUsers(users.map((u) => u.id));

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    sessionCount: u._count.sessions,
    currentStreak: streaks.get(u.id) ?? 0,
    isFollowing: u.followers.length > 0,
  }));
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("You can't follow yourself");
  }
  return prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId } },
    create: { followerId, followingId },
    update: {},
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  const result = await prisma.follow.deleteMany({ where: { followerId, followingId } });
  return result.count > 0;
}

export async function getFollowingTimeline(userId: string, limit = 30) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);
  if (followingIds.length === 0) return [];

  const sessions = await prisma.riyazSession.findMany({
    where: { userId: { in: followingIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true } },
      raag: { select: { id: true, name: true } },
      likes: { where: { userId }, select: { id: true } },
      _count: { select: { likes: true } },
    },
  });

  const streaks = await getCurrentStreaksForUsers(followingIds);

  return sessions.map((s) => ({
    id: s.id,
    user: { ...s.user, currentStreak: streaks.get(s.user.id) ?? 0 },
    raag: s.raag,
    practiceDate: toDateOnly(s.practiceDate),
    durationMinutes: s.durationMinutes,
    types: s.types,
    createdAt: s.createdAt,
    likeCount: s._count.likes,
    likedByMe: s.likes.length > 0,
  }));
}

export async function likeSession(userId: string, sessionId: string) {
  return prisma.like.upsert({
    where: { userId_sessionId: { userId, sessionId } },
    create: { userId, sessionId },
    update: {},
  });
}

export async function unlikeSession(userId: string, sessionId: string) {
  const result = await prisma.like.deleteMany({ where: { userId, sessionId } });
  return result.count > 0;
}

export async function logRiyazSession(
  userId: string,
  input: {
    raagName: string;
    practiceDate?: string;
    durationMinutes?: number;
    types?: RiyazType[];
  },
) {
  const normalizedName = input.raagName.trim().toLowerCase();
  const raag = await prisma.raag.upsert({
    where: { normalizedName },
    create: { name: input.raagName.trim(), normalizedName, createdById: userId },
    update: {},
  });

  const session = await prisma.riyazSession.create({
    data: {
      userId,
      raagId: raag.id,
      practiceDate: new Date(`${input.practiceDate ?? toDateOnly(new Date())}T00:00:00Z`),
      durationMinutes: input.durationMinutes,
      types: input.types ?? [],
    },
    include: { raag: { select: { id: true, name: true } } },
  });
  return serializeSession(session);
}
