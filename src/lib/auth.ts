import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, verifyToken } from "@/lib/jwt";

export { AUTH_COOKIE_NAME, signToken, verifyToken, setAuthCookie, clearAuthCookie } from "@/lib/jwt";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getUserFromRequest(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return prisma.user.findUnique({ where: { id: payload.userId } });
}

export function toPublicUser(user: { id: string; name: string; email: string; role: "ADMIN" | "USER" }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
