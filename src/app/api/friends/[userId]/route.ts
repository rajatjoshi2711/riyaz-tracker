import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { followUser, unfollowUser } from "@/lib/data";

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { userId } = await params;
  if (userId === user.id) {
    return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });
  }

  await followUser(user.id, userId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { userId } = await params;
  await unfollowUser(user.id, userId);
  return NextResponse.json({ ok: true });
}
