'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import type { AppRole } from '@court-iq/auth'
import { hasRole } from '@court-iq/auth'

interface Props {
  children: React.ReactNode
  allowedRoles: AppRole[]
}

export function RoleGate({ children, allowedRoles }: Props) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-slate">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    redirect('/login')
  }

  const userRole = (session.user as { role?: AppRole }).role
  if (!userRole || !allowedRoles.some((role) => hasRole(userRole, role))) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
