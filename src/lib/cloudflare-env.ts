import { D1Database } from '@/lib/d1-store'

/**
 * Environment interface for Cloudflare bindings
 */
export interface CloudflareEnv {
  DB?: D1Database
}

/**
 * Determine if we're running in production (Cloudflare with D1)
 * or development/test (in-memory store)
 */
export function getEnvironment(request: Request): { 
  env: CloudflareEnv | undefined
  isProduction: boolean 
} {
  // OpenNext/Cloudflare provides bindings through request.cloudflare.env
  const env = (request as any).cloudflare?.env as CloudflareEnv | undefined
  
  // Production = D1 binding exists
  // Development/Test = No D1 binding (use in-memory store)
  const isProduction = Boolean(env?.DB)
  
  return { env, isProduction }
}

/**
 * Log environment detection for debugging
 */
export function logEnvironment(routeName: string, isProduction: boolean): void {
  console.log(`[${routeName}] Environment: ${isProduction ? 'PRODUCTION (D1)' : 'DEVELOPMENT (in-memory)'}`)
}
