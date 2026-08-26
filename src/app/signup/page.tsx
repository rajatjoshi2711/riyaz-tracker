"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/apiClient";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await signup({ name, email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="ef-card ef-rise w-full max-w-md">
        <p className="ef-eyebrow mb-2">Riyaz tracker</p>
        <h1 className="ef-page mb-6">Create your account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="ef-field-label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="ef-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              autoComplete="name"
            />
          </div>

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
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="ef-field-label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="ef-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="ef-error-text">{error}</p>}

          <button type="submit" className="ef-btn ef-btn-primary mt-2" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="ef-small mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="ef-btn-text">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
