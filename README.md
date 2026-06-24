# Court IQ

> Score it live. Run it smart.

Court IQ is a production-grade tournament management platform built specifically for pickleball — automating score entry, pool seeding, playoff draws, and DUPR submissions with a two-step confirmation workflow.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (TypeScript) |
| Monorepo | Turborepo + pnpm workspaces |
| UI | shadcn/ui + Tailwind CSS |
| Database | PostgreSQL via Prisma |
| Hosting | Cloudflare Pages + Workers |
| Auth | Phone OTP (NextAuth v5) |
| DUPR | CSV export fallback |

## Branches

| Branch | Purpose |
|---|---|
| `main` | Production |
| `staging` | Demo & Testing |
| `dev` | Active Development |

## Getting Started

```bash
# Install dependencies
pnpm install

# Run dev
pnpm dev

# Build all apps
pnpm build

# Run DB migrations
pnpm db:migrate

# Seed DB
pnpm db:seed
```

## Monorepo Structure

```
court-iq/
├── apps/
│   ├── web/          # Next.js app (Cloudflare Pages)
│   └── worker/       # Cloudflare Worker (async jobs)
├── packages/
│   ├── ui/           # shadcn/ui design system
│   ├── core/         # Tournament engine & business logic
│   ├── db/           # Prisma schema & repositories
│   ├── auth/         # Phone OTP & RBAC
│   ├── config/       # Shared ESLint, TS, Tailwind configs
│   └── types/        # Shared TypeScript interfaces
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Roles

- **Admin** — create tournaments, manage participants, export DUPR
- **Referee** — confirm scores, trigger DUPR upload queue
- **Umpire** — live score entry on Court Desk
- **Spectator** — read-only live view (public URL)

## License

Private — © Court IQ. All rights reserved.
