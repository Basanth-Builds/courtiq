# Cloudflare Pages Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Connect GitHub to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Create application** → **Pages**
3. Click **"Connect to Git"**
4. Select your repository: `Basanth-Builds/courtiq`
5. Click **"Begin setup"**

---

### Step 2: Configure Build Settings

Use these **EXACT** settings:

#### Basic Settings
- **Project name**: `courtiq` (or any name you prefer)
- **Production branch**: `main` (or `dev` if you want dev as production)
- **Framework preset**: `None`

#### Build Configuration
```
Build command: pnpm run build:web
Build output directory: apps/web/.next
Root directory: (leave blank)
```

**IMPORTANT**: Make sure to use `pnpm run build:web` NOT `cd apps/web && pnpm build`

---

### Step 3: Add Environment Variables

Click **"Add environment variable"** and add:

| Variable Name | Value | For Production |
|--------------|-------|----------------|
| `ADMIN_PASSWORD` | `D!nk$` | ✅ Yes |
| `NODE_VERSION` | `22` | ✅ Yes |

Optional (if you need to override):
| Variable Name | Value | For Production |
|--------------|-------|----------------|
| `NEXT_PUBLIC_APP_NAME` | `Court IQ` | ✅ Yes |

---

### Step 4: Add D1 Database Binding

**IMPORTANT**: This must be done AFTER the first deployment attempt.

1. Go to your Pages project settings
2. Navigate to **Settings** → **Functions** → **D1 database bindings**
3. Click **"Add binding"**
4. Configure:
   - **Variable name**: `DB`
   - **D1 database**: Select `courtiq-db` from dropdown
5. Click **"Save"**

**Note**: If you don't see `courtiq-db` in the dropdown, the database doesn't exist yet. Create it:
```bash
cd apps/web
wrangler d1 create courtiq-db
# Then follow the D1 setup steps in WRANGLER_COMMANDS.md
```

---

### Step 5: Save and Deploy

1. Click **"Save and Deploy"**
2. Wait 2-3 minutes for the build
3. Your site will be live at: `https://courtiq-xxx.pages.dev`

---

## 🔧 Troubleshooting

### Build fails with "can't cd to apps/web"

**Fix**: Make sure your build command is:
```
pnpm run build:web
```

NOT:
```
cd apps/web && pnpm install && pnpm build  ❌
```

The `build:web` script in the root package.json handles the directory change correctly.

---

### Build succeeds but site shows 500 errors

**Cause**: D1 database binding not configured

**Fix**: 
1. Go to **Settings** → **Functions** → **D1 database bindings**
2. Add binding: Variable name `DB` → Select database `courtiq-db`
3. Redeploy

---

### D1 database doesn't exist

**Fix**: Create and seed it from your terminal:
```bash
cd apps/web
wrangler d1 create courtiq-db
wrangler d1 execute courtiq-db --remote --file=./db/schema.sql
wrangler d1 execute courtiq-db --remote --file=./db/seed.sql
```

Then add the database ID to `apps/web/wrangler.toml` and add the D1 binding in Cloudflare dashboard.

---

### Admin login doesn't work

**Cause**: Environment variable not set or incorrect

**Fix**:
1. Go to **Settings** → **Environment variables**
2. Verify `ADMIN_PASSWORD` = `D!nk$` (exactly, case-sensitive)
3. Redeploy

---

### Data doesn't persist / resets on deploy

**Cause**: Using in-memory store instead of D1

**Fix**: The app auto-detects D1 in production. Make sure:
1. D1 binding is configured (`DB` variable → `courtiq-db`)
2. Database has data (run seed.sql if empty)
3. Check API responses - they should be using D1 in production

---

## 🔄 Auto-Deploy on Git Push

Once connected to GitHub:
- Push to `main` → Deploys to production
- Push to `dev` → Creates preview deployment
- Pull requests → Creates preview deployments

You can configure which branch triggers production in **Settings** → **Builds & deployments**.

---

## 📦 Build Output Explained

```
pnpm run build:web
  ↓
cd apps/web && pnpm install && pnpm build
  ↓
next build (Next.js 15)
  ↓
.next directory created
  ↓
Cloudflare Pages serves from apps/web/.next
```

---

## 🎯 Expected Build Output

Successful build should show:
```
✓ Generating static pages (13/13)
✓ Finalizing page optimization

Route (app)                    Size  First Load JS
┌ ○ /                       3.05 kB         104 kB
├ ○ /admin                  4.98 kB         106 kB
├ ○ /admin/login            2.12 kB         103 kB
└ ƒ /api/scores                153 B         101 kB
...

ƒ Middleware                             31.6 kB
```

---

## 🚨 Common Build Errors

### "pnpm: command not found"
**Fix**: Cloudflare should auto-detect pnpm@9.0.0 from package.json. If not, add `NODE_VERSION=22` env var.

### "next: command not found"
**Fix**: Make sure `pnpm install` runs before build. The `build:web` script handles this.

### "Module not found: Can't resolve '@/lib/...'"
**Fix**: TypeScript path aliases should work. Check `apps/web/tsconfig.json` has correct baseUrl.

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Spectator page loads: `https://your-site.pages.dev/`
- [ ] Shows tournament name: "Dink Syndicate Tournament"
- [ ] Shows 3 categories: Open Singles, Open Doubles, Open Doubles 3.8
- [ ] Shows pool standings tables
- [ ] Admin login works: `/admin/login` with password `D!nk$`
- [ ] Admin dashboard loads: `/admin`
- [ ] Can edit match scores
- [ ] Can edit team names
- [ ] Can edit pool names
- [ ] Changes persist after refresh (proves D1 is working)

---

## 🎉 Done!

Your tournament scoring system is now live on Cloudflare Pages with:
- ✅ Global CDN (instant load times worldwide)
- ✅ Auto-scaling (handles thousands of concurrent users)
- ✅ D1 database (persistent data)
- ✅ Auto-deploy on git push
- ✅ Free tier (likely covers all your traffic)

Share the URL with spectators and give the admin password only to organizers!
