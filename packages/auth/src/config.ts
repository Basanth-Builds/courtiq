import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { verifyFirebaseIdToken } from './firebase'

const FirebaseSchema = z.object({
  idToken: z.string().min(1),
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
      name: 'Firebase Phone',
      credentials: {
        idToken: { label: 'Firebase ID Token', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = FirebaseSchema.safeParse(credentials)
        if (!parsed.success) return null

        const firebaseUser = await verifyFirebaseIdToken(parsed.data.idToken)
        if (!firebaseUser) return null

        const { phone, uid } = firebaseUser

        if (!process.env.DATABASE_URL) {
          return { id: uid, phone, name: 'Dev User', role: 'ADMIN' }
        }

        try {
          const { userRepository } = await import('@court-iq/db')
          const user = await userRepository.upsertByPhone(phone)
          return {
            id: user.id,
            phone: user.phone,
            name: user.name ?? undefined,
            role: user.role,
          }
        } catch (error) {
          console.error('[Court IQ] DB upsert failed during sign-in:', error)
          // Allow sign-in even if DB is unavailable; user can be synced later.
          return { id: uid, phone, name: undefined, role: 'SPECTATOR' }
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
