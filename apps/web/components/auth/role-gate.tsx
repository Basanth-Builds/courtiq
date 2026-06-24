'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

type Role = 'admin' | 'referee' | 'umpire' | 'spectator'

interface Props {
  children: React.ReactNode
  allowedRoles: Role[]
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

  return <>{children}</>
}
