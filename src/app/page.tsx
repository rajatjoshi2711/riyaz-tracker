import Link from "next/link";
import { Flame } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6">
      <div className="ef-rise flex max-w-lg flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2 text-[var(--blue-500)]">
          <Flame size={32} strokeWidth={1.5} />
        </div>
        <h1 className="ef-page">
          Track your <span className="ef-accent">flute riyaz</span>
        </h1>
        <p className="ef-lead">
          Log every practice session, discover raags your friends are practicing, and build a
          streak worth keeping.
        </p>
        <div className="flex gap-3">
          <Link href="/signup" className="ef-btn ef-btn-primary">
            Create an account
          </Link>
          <Link href="/login" className="ef-btn ef-btn-secondary">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
