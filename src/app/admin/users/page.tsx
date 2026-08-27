import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";
import { getUser, getAllUsers } from "@/lib/data";

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminUsersPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) redirect("/login");

  const viewer = await getUser(payload.userId);
  if (!viewer || viewer.role !== "ADMIN") redirect("/dashboard");

  const users = await getAllUsers();

  return (
    <main className="ef-container-product flex w-full min-w-0 flex-col gap-6 py-12">
      <div>
        <Link href="/dashboard" className="ef-btn-text inline-flex items-center gap-1">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to dashboard
        </Link>
      </div>

      <div>
        <p className="ef-eyebrow mb-1">Admin</p>
        <h1 className="ef-page">Onboarded users</h1>
        <p className="ef-caption mt-1">
          {users.length} {users.length === 1 ? "person has" : "people have"} joined Riyaz tracker
        </p>
      </div>

      <div className="ef-card overflow-x-auto p-0">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-left">
              <th className="ef-field-label px-4 py-3">Name</th>
              <th className="ef-field-label px-4 py-3">Email</th>
              <th className="ef-field-label px-4 py-3">Role</th>
              <th className="ef-field-label px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--border-subtle)] last:border-0">
                <td className="ef-body px-4 py-3">{u.name}</td>
                <td className="ef-body px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`ef-badge ${u.role === "ADMIN" ? "ef-badge-info" : "ef-badge-neutral"}`}>
                    {u.role === "ADMIN" ? "Admin" : "User"}
                  </span>
                </td>
                <td className="ef-caption px-4 py-3">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
