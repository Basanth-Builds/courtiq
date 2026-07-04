// Edge-compatible admin auth helpers.
// Uses Web Crypto (SHA-256) — no Node.js-only modules.

export const ADMIN_COOKIE = 'ciq_admin'

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? 'D!nk$'
}

async function digest(value: string): Promise<string> {
  const data = new TextEncoder().encode(value + ':courtiq-admin-v1')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Returns the expected cookie token for the current ADMIN_PASSWORD. */
export async function adminToken(): Promise<string> {
  return digest(getAdminPassword())
}

/** Returns true if the provided candidate password is correct. */
export async function verifyAdminPassword(candidate: string): Promise<boolean> {
  return candidate === getAdminPassword()
}

/** Returns true if the provided cookie value is valid. */
export async function verifyAdminToken(cookieValue: string): Promise<boolean> {
  const expected = await adminToken()
  return cookieValue === expected
}
