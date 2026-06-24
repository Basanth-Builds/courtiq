# Court IQ 🎾

> **Score it live. Run it smart.**

Court IQ is a production-grade tournament management platform for pickleball — automating scoring, seeding, playoff brackets, and DUPR submission end-to-end.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Monorepo**: Turborepo + pnpm workspaces
- **UI**: shadcn/ui + Tailwind CSS v4
- **Auth**: Phone OTP (Twilio)
- **Database**: PostgreSQL + Prisma ORM
- **Hosting**: Cloudflare Pages + Workers
- **Real-time**: WebSockets via Cloudflare Durable Objects
- **Jobs**: Cloudflare Workers (DUPR CSV export, notifications)

## Monorepo Structure

```
court-iq/
├── apps/
│   ├── web/          # Next.js web app
│   └── worker/       # Cloudflare background worker
├── packages/
│   ├── ui/           # Shared design system (shadcn/ui)
│   ├── core/         # Tournament engine & business logic
│   ├── db/           # Prisma schema & repositories
│   ├── auth/         # Phone OTP & RBAC
│   ├── config/       # Shared lint/ts/tailwind configs
│   └── types/        # Shared TypeScript types
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start development
pnpm dev
```

## Branches

- `main` — Production
- `staging` — Demo & testing
- `dev` — Active development

## License

Private & Proprietary — Court IQ © 2026
