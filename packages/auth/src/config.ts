// Court IQ — NextAuth v4 config
// next-auth v5 beta has a broken ESM import (next/server without .js extension)
// that crashes under Node strict ESM resolver. v4 is stable + fully compatible.
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'

const Schema = z.object({
  phone:   z.string().min(7),
  idToken: z.string().min(10),
})

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'court-iq-dev-secret',

  providers: [
    CredentialsProvider({
      name: 'Phone OTP',
      credentials: {
        phone:   { label: 'Phone',          type: 'tel'  },
        idToken: { label: 'Firebase Token', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = Schema.safeParse(credentials)
        if (!parsed.success) return null

        const { phone, idToken } = parsed.data

        // Verify Firebase ID token server-side
        try {
          const { getApps, initializeApp, cert } = await import('firebase-admin/app')
          const { getAuth } = await import('firebase-admin/auth')

          const adminApp =
            getApps().length > 0
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
            console.error('[Court IQ] Token phone mismatch:', decoded.phone_number, '!==', phone)
            return null
          }
        } catch (e: any) {
          console.error('[Court IQ] Firebase token verify failed:', e?.message)
          return null
        }

        // Upsert user in DB if available
        if (process.env.DATABASE_URL) {
          try {
            const { userRepository } = await import('@court-iq/db')
            const user = await userRepository.upsertByPhone(phone)
            return {
              id:    user.id,
              phone: user.phone,
              name:  user.name ?? '',
              role:  user.role,
            }
          } catch (e) {
            console.error('[Court IQ] DB upsert failed, using dev fallback:', e)
          }
        }

        // Dev fallback — works without a database
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
      if (session.user) {
        session.user.id           = token.id as string
        ;(session.user as any).phone = token.phone
        ;(session.user as any).role  = token.role
      }
      return session
    },
  },

  pages:   { signIn: '/login' },
  session: { strategy: 'jwt' },
}

// v4 export pattern
const nextAuthResult = NextAuth(authOptions)
export const handlers = nextAuthResult
export const { auth, signIn, signOut } = nextAuthResult as any
