import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatScore(team1: number, team2: number): string {
  return `${team1} - ${team2}`
}

export function getMatchStatus(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    scheduled: { label: 'Scheduled', color: 'text-foreground-muted' },
    in_progress: { label: 'Live', color: 'text-brand-green' },
    pending_umpire: { label: 'Pending Umpire', color: 'text-warning' },
    pending_referee: { label: 'Pending Referee', color: 'text-info' },
    confirmed: { label: 'Confirmed', color: 'text-success' },
    dupr_submitted: { label: 'DUPR Submitted', color: 'text-brand-green' },
  }
  return map[status] ?? { label: status, color: 'text-foreground-muted' }
}
