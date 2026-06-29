import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const Schema = z.object({
  phone:   z.string().min(7),
  idToken: z.string().min(10),  // Firebase ID token
})

// Guard broken localStorage stub
if (typeof globalThis !== 'undefined') {
  const ls = (globalThis as any).localStorage
  if (!ls || typeof ls.getItem !== 'function') {
    ;(globalThis as any).localStorage = {
      getItem: () => null, setItem: () => {}, removeItem: () => {},
      clear: () => {}, length: 0, key: () => null,
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
        phone:   { label: 'Phone',          type: 'tel'  },
        idToken: { label: 'Firebase Token', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = Schema.safeParse(credentials)
        if (!parsed.success) return null

        const { phone, idToken } = parsed.data

        // Verify Firebase token server-side
        try {
          const { adminAuth } = await import('../../../apps/web/src/lib/firebase-admin')
          const decoded = await adminAuth.verifyIdToken(idToken)
          // Ensure token matches the claimed phone
          if (decoded.phone_number !== phone) return null
        } catch (e) {
          console.error('[Court IQ] Firebase token invalid:', e)
          return null
        }

        // Upsert user in DB (skip if no DB in dev)
        if (process.env.DATABASE_URL) {
          try {
            const { userRepository } = await import('@court-iq/db')
            const user = await userRepository.upsertByPhone(phone)
            return { id: user.id, phone: user.phone, name: user.name ?? undefined, role: user.role }
          } catch (e) {
            console.error('[Court IQ] DB upsert failed:', e)
          }
        }

        // Dev fallback — return minimal user without DB
        return { id: `firebase-${phone}`, phone, name: 'Dev User', role: 'ADMIN' }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id    = user.id
        token.phone = (user as any).phone
        token.role  = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id         = token.id as string
        ;(session.user as any).phone = token.phone
        ;(session.user as any).role  = token.role
      }
      return session
    },
  },

  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
})
