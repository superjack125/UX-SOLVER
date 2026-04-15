import { prisma } from "./prisma";
import type { Ticket, Prisma } from "@prisma/client";
import { ticketSchema, updateTicketSchema, type TicketInput, type TicketUpdateInput } from "./validators";

export const priorities = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
] as const;

export const statuses = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
] as const;

const createInitialDemoTickets = (): Ticket[] => [
  {
    id: "demo-1",
    title: "Onboarding form is unclear",
    description:
      "The signup form mixes account creation and team setup in one long scroll. Split steps and add progress indicators.",
    priority: "HIGH",
    status: "OPEN",
    reporterEmail: "sam@acme.co",
    assignee: "aria@acme.co",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: "demo-2",
    title: "Contrast issues on dashboard",
    description: "KPIs at the top bar fail WCAG AA contrast on dark mode.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    reporterEmail: "mel@acme.co",
    assignee: "ux-team",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: "demo-3",
    title: "Mobile navigation overlaps content",
    description: "Hamburger opens a panel that hides primary CTA on smaller iPhones.",
    priority: "CRITICAL",
    status: "OPEN",
    reporterEmail: "support@acme.co",
    assignee: "frontend",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

type DemoStoreGlobal = typeof globalThis & {
  __uxSolverDemoTickets?: Ticket[];
};

const globalForDemoStore = globalThis as DemoStoreGlobal;
const demoTickets = globalForDemoStore.__uxSolverDemoTickets ?? createInitialDemoTickets();

if (!globalForDemoStore.__uxSolverDemoTickets) {
  globalForDemoStore.__uxSolverDemoTickets = demoTickets;
}

const canUseDatabase = () => Boolean(process.env.DATABASE_URL);

const createDemoTicket = (input: TicketInput): Ticket => ({
  id: `demo-${Date.now()}`,
  title: input.title,
  description: input.description,
  priority: input.priority,
  status: input.status ?? "OPEN",
  reporterEmail: input.reporterEmail ?? null,
  assignee: input.assignee ?? null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export async function listTickets(): Promise<Ticket[]> {
  if (!canUseDatabase()) {
    return demoTickets;
  }

  try {
    return await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to load tickets; falling back to demo data", error);
    return demoTickets;
  }
}

export async function createTicket(input: TicketInput): Promise<Ticket> {
  const parsed = ticketSchema.parse(input);

  if (!canUseDatabase()) {
    const ticket = createDemoTicket(parsed);
    demoTickets.unshift(ticket);
    return ticket;
  }

  return prisma.ticket.create({ data: parsed });
}

export async function updateTicket(id: string, input: TicketUpdateInput): Promise<Ticket> {
  const parsed = updateTicketSchema.parse(input);

  if (!canUseDatabase()) {
    const index = demoTickets.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error("Ticket not found (demo store)");
    }

    const updated: Ticket = {
      ...demoTickets[index],
      ...parsed,
      updatedAt: new Date(),
    } as Ticket;
    demoTickets[index] = updated;
    return updated;
  }

  return prisma.ticket.update({
    where: { id },
    data: parsed as Prisma.TicketUpdateInput,
  });
}

export async function deleteTicket(id: string): Promise<Ticket> {
  if (!canUseDatabase()) {
    const index = demoTickets.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error("Ticket not found (demo store)");
    }

    const [removed] = demoTickets.splice(index, 1);
    return removed;
  }

  return prisma.ticket.delete({
    where: { id },
  });
}

export function formatRelative(date: Date) {
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    "day",
  );
}
