# Court IQ - Cloudflare Pages Deployment

## Environment Variables

Configure these in Cloudflare Pages dashboard:

### Required for Production

**ADMIN_PASSWORD** (Required)
- Description: Password for admin dashboard access
- Example: Use a strong random password (e.g., `openssl rand -base64 32`)
- Security: Keep secret, never commit to git

### Optional (Only if using Firebase)

If you're using Firebase authentication, configure these:
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY

### Optional (Only if using Prisma/PostgreSQL)

If you're using a database backend:
- DATABASE_URL

## Deployment Setup

### Preview Deployments (dev branch)
1. Go to Cloudflare Pages dashboard
2. Connect to your GitHub repo
3. Set production branch to `main` (or your preferred branch)
4. Set preview branch to `dev`
5. Set build command: `pnpm build`
6. Set build output directory: `.open-next`
7. Add environment variables

### Environment Variables per Branch

You can set different values for production and preview:
- Production variables apply to your main branch
- Preview variables apply to dev/feature branches

## Build Configuration

The app uses OpenNext for Cloudflare compatibility. Build settings in `wrangler.toml` handle the configuration.

## Post-Deployment

After first deployment:
1. Visit `/admin/login` and use your ADMIN_PASSWORD
2. Update tournament data via the admin dashboard
3. Public spectator view is at `/`
4. No database migration needed for in-memory store
