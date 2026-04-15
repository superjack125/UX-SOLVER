# UX Solver - Copilot Instructions

## Project Overview
UX Solver is a ticketing system for tracking and managing UX problems. Built with Next.js, TypeScript, and modern web technologies.

## Development Status
- [x] Project structure created
- [x] copilot-instructions.md file created
- [x] Next.js scaffolding complete
- [x] Ticketing system features implemented
- [x] Dependencies installed
- [x] Development server configured

## Tech Stack
- Frontend: Next.js 16 with App Router
- Language: TypeScript
- Styling: Tailwind CSS 4
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth.js v4

## Project Structure
```
ux-solver/
├── app/              # Next.js app directory
│   ├── api/          # API routes (tickets, auth)
│   ├── login/        # Login page
│   └── page.tsx      # Dashboard
├── components/       # React components
├── lib/              # Utilities, validators, auth
├── prisma/           # Database schema
├── types/            # TypeScript type declarations
└── public/           # Static assets
```

## Development Guidelines
- Use TypeScript strict mode
- Follow Next.js 14+ best practices
- Implement responsive design
- Use server components by default
- Add proper error handling
- Prisma client must be generated before builds

## Key Features
- Ticket CRUD with priority and status tracking
- Demo data fallback when DATABASE_URL not configured
- NextAuth credentials provider for authentication
- Zod validation for API inputs
- Tailwind-based responsive UI

## Setup Commands
```bash
npm install
npx prisma generate
npm run dev
```
