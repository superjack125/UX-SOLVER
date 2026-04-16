import { NextRequest, NextResponse } from "next/server";
import { notifyTicketUpdated } from "@/lib/notifications";
import { deleteTicket, getTicketById, updateTicket } from "@/lib/tickets";
import { updateTicketSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const json = await req.json();
  const parsed = updateTicketSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const before = await getTicketById(id);
    if (!before) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = await updateTicket(id, parsed.data);

    notifyTicketUpdated({ before, after: ticket }).catch((error) => {
      console.error("Ticket update notification failed", error);
    });

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update ticket";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const ticket = await deleteTicket(id);
    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete ticket";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
