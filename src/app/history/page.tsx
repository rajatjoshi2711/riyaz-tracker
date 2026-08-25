import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";
import { getUserSessions } from "@/lib/data";
import SessionList from "@/components/SessionList";

const PAGE_SIZE = 20;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  const { sessions, total } = await getUserSessions(payload.userId, page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="ef-container-product flex flex-col gap-6 py-12">
      <div>
        <Link href="/dashboard" className="ef-btn-text inline-flex items-center gap-1">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to dashboard
        </Link>
      </div>

      <h1 className="ef-page">Practice history</h1>

      <SessionList sessions={sessions} />

      <div className="flex items-center justify-between">
        <Link
          href={`/history?page=${page - 1}`}
          className={`ef-btn ef-btn-secondary ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
          aria-disabled={page <= 1}
        >
          Previous
        </Link>
        <p className="ef-caption">
          Page {page} of {totalPages}
        </p>
        <Link
          href={`/history?page=${page + 1}`}
          className={`ef-btn ef-btn-secondary ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
          aria-disabled={page >= totalPages}
        >
          Next
        </Link>
      </div>
    </main>
  );
}
