import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const OtpSchema = z.object({
  phone: z.string().min(7),
  code: z.string().length(6),
})

// Guard broken localStorage stub from --localstorage-file Node flag
if (typeof globalThis !== 'undefined') {
  const ls = (globalThis as any).localStorage
  if (!ls || typeof ls.getItem !== 'function') {
    ;(globalThis as any).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? 'court-iq-dev-secret-change-in-production',

  providers: [
    Credentials({
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        code: { label: 'OTP Code', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = OtpSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { phone, code } = parsed.data
        const isDev = process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL

        if (isDev) {
          // Accept master dev bypass
          if (code === '000000') {
            return { id: `dev-${phone}`, phone, name: 'Dev User', role: 'ADMIN' }
          }
          // Verify via internal API (shares the same in-memory store)
          try {
            const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
            const res = await fetch(`${base}/api/auth/verify-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone, code }),
            })
            if (!res.ok) return null
          } catch {
            return null
          }
          return { id: `dev-${phone}`, phone, name: 'Dev User', role: 'ADMIN' }
        }

        // Production
        if (!process.env.DATABASE_URL) return null
        const { userRepository } = await import('@court-iq/db')
        const session = await userRepository.verifyOtpSession(phone, code)
        if (!session) return null
        const user = await userRepository.upsertByPhone(phone)
        return {
          id: user.id,
          phone: user.phone,
          name: user.name ?? undefined,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = (user as any).phone
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).phone = token.phone
        ;(session.user as any).role = token.role
      }
      return session
    },
  },

  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
})
