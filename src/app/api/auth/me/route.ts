import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, toPublicUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ user: toPublicUser(user) });
}
