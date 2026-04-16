import { NextResponse } from "next/server";
import { createTicket, listTickets } from "@/lib/tickets";
import { notifyTicketCreated } from "@/lib/notifications";
import { ticketSchema } from "@/lib/validators";

export async function GET() {
  const tickets = await listTickets();
  return NextResponse.json({ tickets, source: process.env.DATABASE_URL ? "database" : "demo" });
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = ticketSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ticket = await createTicket(parsed.data);

  notifyTicketCreated(ticket).catch((error) => {
    console.error("Ticket creation notification failed", error);
  });

  return NextResponse.json(ticket, { status: 201 });
}
