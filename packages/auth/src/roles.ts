// ============================================================
// Court IQ — RBAC Role Utilities
// ============================================================

export type AppRole = 'ADMIN' | 'REFEREE' | 'UMPIRE' | 'SPECTATOR'

export const ROLE_HIERARCHY: Record<AppRole, number> = {
  ADMIN: 4,
  REFEREE: 3,
  UMPIRE: 2,
  SPECTATOR: 1,
}

/**
 * Check if a user role meets the minimum required role.
 */
export function hasRole(userRole: AppRole, requiredRole: AppRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Check if user is admin.
 */
export function isAdmin(role: AppRole): boolean {
  return role === 'ADMIN'
}

/**
 * Check if user can approve matches (referee or above).
 */
export function canApproveMatches(role: AppRole): boolean {
  return hasRole(role, 'REFEREE')
}

/**
 * Check if user can enter scores (umpire or above).
 */
export function canEnterScores(role: AppRole): boolean {
  return hasRole(role, 'UMPIRE')
}

/**
 * Role display labels.
 */
export const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: 'Tournament Admin',
  REFEREE: 'Tournament Referee',
  UMPIRE: 'Court Umpire',
  SPECTATOR: 'Spectator',
}

/**
 * Role badge color tokens for UI.
 */
export const ROLE_COLORS: Record<AppRole, string> = {
  ADMIN: 'bg-red-500/15 text-red-400',
  REFEREE: 'bg-court-green/15 text-court-green',
  UMPIRE: 'bg-blue-500/15 text-blue-400',
  SPECTATOR: 'bg-zinc-500/15 text-zinc-400',
}
