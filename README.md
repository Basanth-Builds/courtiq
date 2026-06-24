# Court IQ 🏓

> **Score it live. Run it smart.**

Court IQ is a production-grade tournament management platform built for pickleball — automating score entry, pool seeding, playoff draws, and DUPR submission from a single smart interface.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Hosting | Cloudflare Pages + Workers |
| Auth | Phone OTP via Twilio Verify |
| UI | shadcn/ui + Tailwind CSS v4 |
| Database | PostgreSQL + Prisma |
| Monorepo | Turborepo + pnpm |
| Jobs | Cloudflare Workers |

## Apps & Packages

| Package | Description |
|---------|-------------|
| `apps/web` | Main Next.js web application |
| `apps/worker` | Cloudflare Worker for background jobs |
| `packages/ui` | Shared shadcn/ui component system |
| `packages/core` | Tournament engine, seeding, bracket logic |
| `packages/db` | Prisma schema + data access layer |
| `packages/auth` | Phone OTP + RBAC |
| `packages/types` | Shared TypeScript types |
| `packages/config` | Shared ESLint, TS, Tailwind configs |

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env file
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed sample data
pnpm db:seed

# Start all apps in dev mode
pnpm dev
```

## Branches

| Branch | Purpose |
|--------|----------|
| `main` | Production |
| `staging` | Demo & testing |
| `dev` | Active development |

## License

Private — Court IQ © 2026
