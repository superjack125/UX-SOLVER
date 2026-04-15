import { z } from "zod";

export const ticketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  reporterEmail: z.string().email("Provide a valid email").optional(),
  assignee: z.string().optional(),
});

export const updateTicketSchema = ticketSchema.partial();

export type TicketInput = z.infer<typeof ticketSchema>;
export type TicketUpdateInput = z.infer<typeof updateTicketSchema>;
