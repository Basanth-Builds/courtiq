# Simple Cloudflare Deployment Guide

## 🎉 Simplified Structure

The app is now a **simple standalone Next.js application** - no more monorepo complexity!

```
courtiq/
├── src/
│   ├── app/              # Pages & API routes
│   ├── components/       # UI components
│   └── lib/              # Utilities, auth, db
├── db/
│   ├── schema.sql        # D1 database schema
│   └── seed.sql          # Initial data
├── public/               # Static assets
├── wrangler.toml         # Cloudflare config
├── package.json          # Single package.json
└── next.config.ts        # Next.js config
```

---

## 🚀 Deploy to Cloudflare Pages

### Option 1: Auto-Deploy from GitHub (Recommended) ⭐

1. **Go to Cloudflare Dashboard**
   - Navigate to Workers & Pages
   - Click "Create application"
   - Choose "Pages" → "Connect to Git"

2. **Connect Repository**
   - Select: `Basanth-Builds/courtiq`
   - Branch: `simplified`

3. **Configure Build**
   ```
   Framework preset: Next.js
   Build command: pnpm run build
   Build output directory: .next
   Root directory: (leave empty)
   ```

4. **Environment Variables** (none needed initially)

5. **Deploy!**
   - Click "Save and Deploy"
   - Auto-deploys on every git push

---

### Option 2: Manual Deploy with Wrangler

```bash
# Build the app
pnpm run build

# Deploy to Cloudflare
pnpm run deploy
```

---

## 🗄️ Database Setup (D1)

### 1. Create D1 Database

```bash
wrangler d1 create courtiq-db
```

Copy the database ID from the output.

### 2. Update wrangler.toml

Edit `wrangler.toml` and add your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "courtiq-db"
database_id = "your-database-id-here"  # ← Paste here
```

### 3. Initialize Schema

```bash
wrangler d1 execute courtiq-db --remote --file=./db/schema.sql
```

### 4. Seed Data

```bash
wrangler d1 execute courtiq-db --remote --file=./db/seed.sql
```

### 5. Verify

```bash
wrangler d1 execute courtiq-db --remote --command "SELECT * FROM tournaments;"
```

---

## 📋 Quick Commands

```bash
# Local development
pnpm run dev

# Type check
pnpm run typecheck

# Build
pnpm run build

# Deploy
pnpm run deploy
```

---

## ✅ What's Simplified

**Before (Monorepo):**
- ❌ Turborepo configuration
- ❌ Multiple package.json files
- ❌ Workspace dependencies
- ❌ Complex build commands
- ❌ `cd apps/web && ...` everywhere

**After (Standalone):**
- ✅ Single Next.js app
- ✅ One package.json
- ✅ Simple commands: `pnpm build`, `pnpm deploy`
- ✅ Direct Cloudflare Pages deployment
- ✅ No monorepo complexity

---

## 🎯 Production Checklist

- ✅ TypeScript validated (no errors)
- ✅ Build successful
- ✅ Standalone Next.js app
- ✅ Cloudflare D1 ready
- ✅ Simple deployment process
- ✅ Auto-deploy on git push

---

## 🔑 Admin Access

- **Login URL**: `https://your-domain.com/admin/login`
- **Password**: `D!nk$`

---

## 📊 Tournament Details

- **Name**: Dink Syndicate Tournament
- **Date**: July 5, 2026
- **Venue**: Picklers' Hub - Visakhpatnam
- **Categories**:
  - Open Singles
  - Open Doubles
  - Openb Doubles 3.8

---

## 🆘 Troubleshooting

### Build fails
```bash
# Clean and rebuild
rm -rf .next node_modules
pnpm install
pnpm run build
```

### Database not working
```bash
# Check D1 binding
wrangler d1 list

# Test database
wrangler d1 execute courtiq-db --remote --command "SELECT COUNT(*) FROM tournaments;"
```

### Deploy fails
```bash
# Ensure you're logged in
wrangler login

# Try deploy again
pnpm run deploy
```

---

## 🎉 Done!

Your tournament system is now a simple, production-ready Next.js app that deploys to Cloudflare Pages with a single command!

**No more monorepo complexity!** 🚀
