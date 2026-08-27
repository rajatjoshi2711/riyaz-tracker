import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { likeSession, unlikeSession } from "@/lib/data";

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { sessionId } = await params;
  await likeSession(user.id, sessionId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { sessionId } = await params;
  await unlikeSession(user.id, sessionId);
  return NextResponse.json({ ok: true });
}
