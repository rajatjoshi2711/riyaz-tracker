"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full min-w-0 items-center justify-center px-6">
      <div className="ef-card ef-rise w-full max-w-md">
        <p className="ef-eyebrow mb-2">Riyaz tracker</p>
        <h1 className="ef-page mb-6">Sign in</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="ef-field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="ef-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="ef-field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="ef-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="ef-error-text">{error}</p>}

          <button type="submit" className="ef-btn ef-btn-primary mt-2" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="ef-small mt-6 text-center">
          New here?{" "}
          <Link href="/signup" className="ef-btn-text">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
