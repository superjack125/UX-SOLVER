import nodemailer from "nodemailer";
import type { Ticket } from "@prisma/client";

type EmailResult = {
  sent: boolean;
  recipients: string[];
  reason?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isLikelyEmail = (value: string | null | undefined) => {
  if (!value) {
    return false;
  }
  return emailRegex.test(value.trim());
};

const uniqueRecipients = (values: Array<string | null | undefined>) => {
  const normalized = values
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value) && isLikelyEmail(value));

  return [...new Set(normalized)];
};

const getMailerConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "0");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !from) {
    return null;
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: port === 465,
  };
};

type MailerGlobal = typeof globalThis & {
  __uxSolverTransport?: nodemailer.Transporter;
};

const getTransporter = () => {
  const config = getMailerConfig();
  if (!config) {
    return null;
  }

  const globalForMailer = globalThis as MailerGlobal;

  if (!globalForMailer.__uxSolverTransport) {
    globalForMailer.__uxSolverTransport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
    });
  }

  return globalForMailer.__uxSolverTransport;
};

const sendTicketNotification = async ({
  recipients,
  subject,
  text,
}: {
  recipients: string[];
  subject: string;
  text: string;
}): Promise<EmailResult> => {
  const config = getMailerConfig();
  if (!config) {
    return { sent: false, recipients, reason: "SMTP is not configured" };
  }

  if (recipients.length === 0) {
    return { sent: false, recipients, reason: "No valid recipient emails" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, recipients, reason: "SMTP transporter could not be created" };
  }

  await transporter.sendMail({
    from: config.from,
    to: recipients,
    subject,
    text,
  });

  return { sent: true, recipients };
};

export async function notifyTicketCreated(ticket: Ticket): Promise<EmailResult> {
  const recipients = uniqueRecipients([ticket.assignee]);
  return sendTicketNotification({
    recipients,
    subject: `New ticket assigned: ${ticket.title}`,
    text: [
      `A new ticket was assigned to you.`,
      "",
      `ID: ${ticket.id}`,
      `Title: ${ticket.title}`,
      `Status: ${ticket.status}`,
      `Priority: ${ticket.priority}`,
      "",
      "Description:",
      ticket.description,
    ].join("\n"),
  });
}

export async function notifyTicketUpdated({
  before,
  after,
}: {
  before: Ticket;
  after: Ticket;
}): Promise<EmailResult> {
  const recipients = uniqueRecipients([after.reporterEmail, after.assignee, before.reporterEmail, before.assignee]);

  const changedFields: string[] = [];
  if (before.title !== after.title) changedFields.push("title");
  if (before.description !== after.description) changedFields.push("description");
  if (before.priority !== after.priority) changedFields.push("priority");
  if (before.status !== after.status) changedFields.push("status");
  if (before.reporterEmail !== after.reporterEmail) changedFields.push("reporterEmail");
  if (before.assignee !== after.assignee) changedFields.push("assignee");

  return sendTicketNotification({
    recipients,
    subject: `Ticket updated: ${after.title}`,
    text: [
      `A ticket was updated.`,
      "",
      `ID: ${after.id}`,
      `Title: ${after.title}`,
      `Status: ${after.status}`,
      `Priority: ${after.priority}`,
      `Changed fields: ${changedFields.length > 0 ? changedFields.join(", ") : "none"}`,
      "",
      "Description:",
      after.description,
    ].join("\n"),
  });
}
