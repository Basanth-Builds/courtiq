Deployment notes — required Supabase environment variables

When deploying to Vercel (or another host), make sure the following environment variables are set for the project:

- NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)

Why two names? The code supports either the NEXT_PUBLIC_* names (exposed to the browser) or the non-public names. If you prefer to avoid exposing the anon key to the browser, set SUPABASE_URL and SUPABASE_ANON_KEY and update any client-side code that relies on NEXT_PUBLIC_ variables.

How to set in Vercel:
1. Go to your project in Vercel.
2. Settings → Environment Variables.
3. Add the variables for the relevant environments (Preview/Production).
   - Key: NEXT_PUBLIC_SUPABASE_URL
   - Value: https://your-project-id.supabase.co
   - Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Value: <your anon/public API key>

Optional server-only key:
- SUPABASE_SERVICE_ROLE_KEY — if you need elevated server permissions, set this as a server-only (never expose to client) variable in Vercel.

Local testing:
Create a `.env.local` in the repo root with these values to run locally:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then run:

```
npm run dev
# or build
npm run build
```

If you still get the error about missing Supabase credentials during a build on Vercel, double-check that the variables are set for the Production environment (not only Preview) and that there are no trailing spaces or newline characters in the values.
