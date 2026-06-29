import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const Schema = z.object({
  phone:   z.string().min(7),
  idToken: z.string().min(10),
})

// Guard broken localStorage stub from --localstorage-file Node flag
if (typeof globalThis !== 'undefined') {
  const ls = (globalThis as any).localStorage
  if (!ls || typeof ls.getItem !== 'function') {
    ;(globalThis as any).localStorage = {
      getItem: () => null, setItem: () => {},
      removeItem: () => {}, clear: () => {},
      length: 0, key: () => null,
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

        // Verify Firebase token using firebase-admin directly
        // firebase-admin must be in serverExternalPackages so it's not bundled
        try {
          const { getApps, initializeApp, cert } = await import('firebase-admin/app')
          const { getAuth } = await import('firebase-admin/auth')

          const adminApp = getApps().length > 0
            ? getApps()[0]
            : initializeApp({
                credential: cert({
                  projectId:   process.env.FIREBASE_PROJECT_ID!,
                  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
                  privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
                }),
              })

          const decoded = await getAuth(adminApp).verifyIdToken(idToken)
          if (decoded.phone_number !== phone) {
            console.error('[Court IQ] Phone mismatch in token')
            return null
          }
        } catch (e: any) {
          console.error('[Court IQ] Firebase token verify failed:', e?.message)
          return null
        }

        // Upsert in DB if available
        if (process.env.DATABASE_URL) {
          try {
            const { userRepository } = await import('@court-iq/db')
            const user = await userRepository.upsertByPhone(phone)
            return {
              id:    user.id,
              phone: user.phone,
              name:  user.name ?? undefined,
              role:  user.role,
            }
          } catch (e) {
            console.error('[Court IQ] DB upsert failed, falling back to dev user:', e)
          }
        }

        // Dev fallback — no DB required
        return {
          id:    `firebase-${phone}`,
          phone,
          name:  'Dev User',
          role:  'ADMIN',
        }
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
        session.user.id          = token.id as string
        ;(session.user as any).phone = token.phone
        ;(session.user as any).role  = token.role
      }
      return session
    },
  },

  pages:   { signIn: '/login' },
  session: { strategy: 'jwt' },
})
