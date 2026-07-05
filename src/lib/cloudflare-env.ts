import { getCloudflareContext } from '@opennextjs/cloudflare'
import { D1Database } from '@/lib/d1-store'

/**
 * Environment interface for Cloudflare bindings
 */
export interface CloudflareEnv {
  DB?: D1Database
}

/**
 * Get Cloudflare environment bindings using the OpenNext adapter's recommended API.
 * 
 * Uses getCloudflareContext({async: true}) which works in every route handler.
 * Falls back gracefully in local dev (next dev) when no Cloudflare context exists.
 */
export async function getEnvironment(): Promise<{
  env: CloudflareEnv | undefined
  isProduction: boolean
}> {
  try {
    const { env } = await getCloudflareContext({ async: true })
    const cfEnv = env as CloudflareEnv | undefined
    const isProduction = Boolean(cfEnv?.DB)
    return { env: cfEnv, isProduction }
  } catch {
    // Not running inside a Cloudflare Worker (local `next dev`)
    return { env: undefined, isProduction: false }
  }
}

/**
 * Log environment detection for debugging
 */
export function logEnvironment(routeName: string, isProduction: boolean): void {
  console.log(`[${routeName}] Environment: ${isProduction ? 'PRODUCTION (D1)' : 'DEVELOPMENT (in-memory)'}`)
}
