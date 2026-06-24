# Court IQ 🏓

> **Score it live. Run it smart.**

Court IQ is a production-grade tournament management platform built for pickleball — automating score entry, pool seeding, playoff draws, and DUPR submission from a single smart interface.

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Hosting | Cloudflare Pages + Workers |
| Auth | Phone OTP via Twilio Verify |
| UI | shadcn/ui + Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM |
| Monorepo | Turborepo + pnpm |
| Jobs | Cloudflare Workers |
| Real-time | WebSockets (Socket.IO) |

---

## Monorepo Structure

```
court-iq/
├── apps/
│   ├── web/          # Next.js 15 app (main product)
│   └── worker/       # Cloudflare Worker (background jobs)
├── packages/
│   ├── ui/           # Shared shadcn/ui design system
│   ├── core/         # Tournament engine + business logic
│   ├── db/           # Prisma schema + data access
│   ├── auth/         # Phone OTP + RBAC
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared ESLint, TS, Tailwind configs
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env file
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Run DB migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start all apps in dev mode
pnpm dev
```

---

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production |
| `staging` | Demo & QA testing |
| `dev` | Active development |

---

## Roles

| Role | Access |
|------|--------|
| `admin` | Full tournament management |
| `referee` | Final score confirmation + DUPR |
| `umpire` | Court score entry |
| `spectator` | Live view only (public) |

---

## License

Private — Court IQ © 2026
