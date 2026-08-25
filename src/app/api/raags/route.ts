import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { searchRaagsByName } from "@/lib/data";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.get("search") ?? "";
  const raags = await searchRaagsByName(search);
  return NextResponse.json({ raags });
}
