"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { priorities, statuses } from "@/lib/tickets";
import { TicketInput } from "@/lib/validators";

export function TicketForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<TicketInput>({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "OPEN",
    reporterEmail: "",
    assignee: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const update = (key: keyof TicketInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const body = await response.json();
        setError(body?.error ? "Unable to create ticket: " + JSON.stringify(body.error) : "Unable to create ticket");
        return;
      }

      setSuccess("Ticket added. Refreshing...");
      setForm({ ...form, title: "", description: "" });
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">New ticket</p>
          <h2 className="text-lg font-semibold text-slate-900">Capture a UX problem</h2>
        </div>
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Add"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Title
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            required
            minLength={3}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Describe the UX issue"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Reporter email
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            type="email"
            value={form.reporterEmail ?? ""}
            onChange={(e) => update("reporterEmail", e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700 sm:col-span-2">
          Description
          <textarea
            className="min-h-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            required
            minLength={10}
            maxLength={2000}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Explain the problem, steps to reproduce, and affected users"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Priority
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            value={form.priority}
            onChange={(e) => update("priority", e.target.value)}
          >
            {priorities.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Status
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            value={form.status ?? "OPEN"}
            onChange={(e) => update("status", e.target.value)}
          >
            {statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Assignee
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            value={form.assignee ?? ""}
            onChange={(e) => update("assignee", e.target.value)}
            placeholder="team or owner"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-emerald-600">{success}</p> : null}
    </form>
  );
}
