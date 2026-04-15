"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Ticket } from "@prisma/client";
import { formatRelative } from "@/lib/tickets";
import { priorities, statuses } from "@/lib/tickets";

type Props = {
  ticket: Ticket;
};

const statusColors: Record<Ticket["status"], string> = {
  OPEN: "bg-amber-100 text-amber-900",
  IN_PROGRESS: "bg-sky-100 text-sky-900",
  RESOLVED: "bg-emerald-100 text-emerald-900",
  CLOSED: "bg-slate-200 text-slate-900",
};

const priorityColors: Record<Ticket["priority"], string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-sky-600",
  HIGH: "text-amber-600",
  CRITICAL: "text-rose-600",
};

export function TicketCard({ ticket }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    reporterEmail: ticket.reporterEmail ?? "",
    assignee: ticket.assignee ?? "",
  });

  const save = () => {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          reporterEmail: form.reporterEmail.trim() || undefined,
          assignee: form.assignee.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Unable to update ticket");
        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  };

  const markComplete = () => {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Unable to mark ticket as complete");
        return;
      }

      router.refresh();
    });
  };

  const remove = () => {
    if (!window.confirm("Delete this ticket?")) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Unable to delete ticket");
        return;
      }

      router.refresh();
    });
  };

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{ticket.id}</p>
          <h3 className="text-xl font-semibold text-slate-900">{ticket.title}</h3>
        </div>
        <span
          className={`h-8 shrink-0 rounded-full px-3 text-xs font-semibold leading-8 ${statusColors[ticket.status]}`}
        >
          {ticket.status.replace("_", " ")}
        </span>
      </div>

      {isEditing ? (
        <div className="mt-3 grid gap-3">
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            value={form.title}
            minLength={3}
            onChange={(e) => update("title", e.target.value)}
          />
          <textarea
            className="min-h-[100px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            value={form.description}
            minLength={10}
            maxLength={2000}
            onChange={(e) => update("description", e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
            >
              {priorities.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              {statuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
              type="email"
              value={form.reporterEmail}
              onChange={(e) => update("reporterEmail", e.target.value)}
              placeholder="Reporter email"
            />
            <input
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
              value={form.assignee}
              onChange={(e) => update("assignee", e.target.value)}
              placeholder="Assignee"
            />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-700">{ticket.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className={`font-semibold ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
        {ticket.reporterEmail ? <span>Reported by {ticket.reporterEmail}</span> : null}
        {ticket.assignee ? <span>Owner: {ticket.assignee}</span> : null}
        <span className="text-slate-500">Updated {formatRelative(ticket.updatedAt)}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isEditing ? (
          <>
            <button
              type="button"
              className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={save}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setIsEditing(true)}
            disabled={isPending}
          >
            Modify
          </button>
        )}

        <button
          type="button"
          className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={markComplete}
          disabled={isPending || ticket.status === "CLOSED"}
        >
          {ticket.status === "CLOSED" ? "Completed" : "Mark Complete"}
        </button>

        <button
          type="button"
          className="rounded-full bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={remove}
          disabled={isPending}
        >
          Delete
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </article>
  );
}
