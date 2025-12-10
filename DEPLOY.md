# Deployment Guide

## Required Environment Variables

When deploying to Vercel, Netlify, or another host, set these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon/public API key

**Where to find these:**

1. Go to your Supabase dashboard
2. Settings → API
3. Copy the **Project URL** and **anon** key (not the service_role key)

## Vercel Deployment

### Steps

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the two variables for **Production** and **Preview** environments
4. Ensure values have no trailing spaces or newlines
5. Redeploy the project

### Optional: Server-Only Keys

If you need elevated server permissions, also set:

- `SUPABASE_SERVICE_ROLE_KEY` — Set as **server-only** (never expose to client)

## Netlify Deployment

The repo includes `netlify.toml` with the correct configuration for Next.js.

### Steps

1. Go to your Netlify site dashboard
2. Click **Site Settings** → **Build & Deploy** → **Environment**
3. Add the two variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Trigger a new deploy

### Why netlify.toml Matters

- **`publish = ".next"`** — Tells Netlify where Next.js outputs the built files
- **`command = "npm run build"`** — Runs the build command
- This prevents the error: "Your publish directory cannot be the same as the base directory"

## Local Development

### Setup

Create `.env.local` in the repo root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase
```

### Test Locally

```bash
npm run dev
# Visit http://localhost:3000
```

### Test Build

```bash
npm run build
npm start
```

## Troubleshooting

### "Supabase environment variables are not set"

**Cause:** Missing env vars in deployment environment

**Fix:** Double-check that variables are set in the deployment platform (Vercel/Netlify) for the correct environment (Production, not just Preview)

### "publish directory cannot be the same as base directory" (Netlify only)

**Cause:** Missing or incorrect `netlify.toml`

**Fix:** Ensure `netlify.toml` exists in the repo root with `publish = ".next"`

### Build succeeds locally but fails on deploy

**Cause:** Environment variables not set on the deployment platform

**Fix:** Verify both variables are set and have no extra whitespace
