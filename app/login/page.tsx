"use client";

import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", { redirect: false, email, password });
      if (result?.error) {
        setError("Unable to sign in. Check credentials or configure DEMO_USER vars.");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur"
      >
        <h1 className="text-xl font-semibold text-slate-900">Sign in to UX Solver</h1>
        <p className="mt-1 text-sm text-slate-600">Demo credentials are read from environment variables.</p>

        <label className="mt-6 flex flex-col gap-2 text-sm text-slate-700">
          Email
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="mt-4 flex flex-col gap-2 text-sm text-slate-700">
          Password
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? "Signing in..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
