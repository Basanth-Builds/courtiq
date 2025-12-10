// Helper to centralize reading Supabase env vars and give a clear error
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    // Provide a clear, actionable message for Vercel deployments
    throw new Error(
      'Supabase environment variables are not set.\n' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_ANON_KEY) in your deployment environment.\n' +
        'See: https://supabase.com/docs/guides/hosting/vercel and https://vercel.com/docs/concepts/projects/environment-variables'
    )
  }

  return { url, key }
}
