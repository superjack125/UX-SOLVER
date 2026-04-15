import { TicketForm } from "@/components/TicketForm";
import { TicketCard } from "@/components/TicketCard";
import { listTickets } from "@/lib/tickets";

export default async function Home() {
  const tickets = await listTickets();
  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const critical = tickets.filter((t) => t.priority === "CRITICAL").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-50">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-slate-900/30 backdrop-blur md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-300">UX Solver</p>
            <h1 className="text-3xl font-semibold md:text-4xl">A ticketing system for UX problems</h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Capture UX issues, prioritize them, and keep status visible for stakeholders. Fully typed, API-backed, and
              ready for PostgreSQL + Prisma.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase text-slate-200">Open</p>
              <p className="text-2xl font-semibold">{openTickets}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase text-slate-200">In progress</p>
              <p className="text-2xl font-semibold">{inProgress}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase text-slate-200">Critical</p>
              <p className="text-2xl font-semibold">{critical}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-white">Tickets</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-300">{tickets.length} items</span>
            </div>
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-slate-200">
                  No tickets yet. Add a UX issue using the form.
                </p>
              ) : (
                tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
              )}
            </div>
          </div>

          <TicketForm />
        </section>
      </main>
    </div>
  );
}
