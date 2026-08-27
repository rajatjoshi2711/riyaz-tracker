import { prisma } from "@/lib/db";
import { computeStreaks, toDateOnly } from "@/lib/streaks";
import type { RiyazType } from "@/generated/prisma/enums";

const DAY_MS = 86_400_000;
const DEFAULT_RANGE_DAYS = 365;

export function getUser(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
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

export async function getTopPracticedRaags(limit = 10) {
  const grouped = await prisma.riyazSession.groupBy({
    by: ["raagId"],
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
