import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserCalendar } from "@/lib/data";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const result = await getUserCalendar(
    user.id,
    searchParams.get("from") ?? undefined,
    searchParams.get("to") ?? undefined,
  );
  return NextResponse.json(result);
}
