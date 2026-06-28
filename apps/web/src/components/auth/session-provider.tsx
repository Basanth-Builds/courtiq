'use client'

// Isolated SessionProvider wrapper — only imported in authenticated layouts
// Never imported at the root layout level to prevent SSR localStorage crash
import { SessionProvider } from 'next-auth/react'

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/auth" refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  )
}
