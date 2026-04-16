## UX Solver

Ticketing system for UX problems, built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and NextAuth.

### Quickstart

1) Copy env vars

```bash
cp .env.example .env
# update DATABASE_URL, NEXTAUTH_SECRET, DEMO_USER_PASSWORD_HASH
```

2) Install dependencies

```bash
npm install
```

3) Generate Prisma client and run migrations (adjust provider if using SQLite locally)

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4) Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 to use the app.

### Authentication

- NextAuth with Prisma Adapter.
- Default Credentials provider reads `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD_HASH` (bcrypt) from `.env` for a demo login.
- Replace with your provider (OAuth/email/SAML) when ready.

### Ticket model (Prisma)

- `Ticket`: `id`, `title`, `description`, `priority (LOW|MEDIUM|HIGH|CRITICAL)`, `status (OPEN|IN_PROGRESS|RESOLVED|CLOSED)`, `reporterEmail`, `assignee`, timestamps.
- Includes NextAuth tables (`User`, `Account`, `Session`, `VerificationToken`).

### API routes

- `POST /api/tickets` – create ticket.
- `GET /api/tickets` – list tickets (falls back to demo data when DB not configured).
- `PATCH /api/tickets/:id` – update ticket fields.
- `GET/POST /api/auth/[...nextauth]` – NextAuth handlers.

### Email notifications

Ticket notifications are sent on create and update when SMTP is configured.

Set these environment variables:

- `SMTP_HOST` (example: `smtp.gmail.com`)
- `SMTP_PORT` (example: `587`)
- `SMTP_FROM` (sender address, example: `UX Solver <no-reply@yourdomain.com>`)
- `SMTP_USER` (optional, depending on provider)
- `SMTP_PASS` (optional, depending on provider)

Notification recipients are taken from ticket emails:

- `reporterEmail` if it is a valid email
- `assignee` when it contains an email address

### UI

- Dashboard at `/` with ticket stats, list, and submission form.
- `/login` for credentials-based sign-in.

### Scripts

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – lint codebase

### Notes

- Writes work in both database mode and demo mode.
- If SMTP is not configured, ticket APIs still succeed and notification sending is skipped.
- Use PostgreSQL in production; SQLite can be used locally by setting `provider = "sqlite"` and `DATABASE_URL="file:./dev.db"` in `prisma/schema.prisma` and `.env`.
