import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'

const Schema = z.object({
  phone:   z.string().min(7),
  idToken: z.string().min(10),
})

// Singleton Firebase Admin — initialised once, reused across requests
let adminAppPromise: Promise<any> | null = null

async function getAdminApp() {
  if (adminAppPromise) return adminAppPromise
  adminAppPromise = (async () => {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app')
    if (getApps().length > 0) return getApps()[0]

    const projectId   = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const rawKey      = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !rawKey) {
      throw new Error(
        `[Court IQ] Missing Firebase Admin env vars. ` +
        `projectId=${!!projectId} clientEmail=${!!clientEmail} privateKey=${!!rawKey}`
      )
    }

    // .env files store \n as literal two-char sequence \\n
    // Handle both: already-real-newlines and escaped \n strings
    const privateKey = rawKey.includes('\\n')
      ? rawKey.replace(/\\n/g, '\n')
      : rawKey

    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  })()
  return adminAppPromise
}

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
        try {
          const parsed = Schema.safeParse(credentials)
          if (!parsed.success) {
            console.error('[Court IQ] authorize: invalid credentials shape', credentials)
            return null
          }

          const { phone, idToken } = parsed.data
          console.log('[Court IQ] authorize: verifying token for', phone)

          const adminApp = await getAdminApp()
          const { getAuth } = await import('firebase-admin/auth')
          const decoded = await getAuth(adminApp).verifyIdToken(idToken)

          console.log('[Court IQ] authorize: token OK, phone in token =', decoded.phone_number)

          if (decoded.phone_number !== phone) {
            console.error('[Court IQ] authorize: phone mismatch', decoded.phone_number, '!==', phone)
            return null
          }

          // Upsert in DB if available
          if (process.env.DATABASE_URL) {
            try {
              const { userRepository } = await import('@court-iq/db')
              const user = await userRepository.upsertByPhone(phone)
              return { id: user.id, phone: user.phone, name: user.name ?? '', role: user.role }
            } catch (dbErr) {
              console.error('[Court IQ] DB upsert failed, using dev fallback:', dbErr)
            }
          }

          // Dev fallback — no DB required
          console.log('[Court IQ] authorize: success (dev fallback), phone =', phone)
          return { id: `firebase-${phone}`, phone, name: 'Dev User', role: 'ADMIN' }

        } catch (err: any) {
          // Log full error so terminal shows exactly what broke
          console.error('[Court IQ] authorize CRASHED:', err?.message ?? err)
          return null
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
        (session.user as any).id     = token.id as string
        ;(session.user as any).phone = token.phone
        ;(session.user as any).role  = token.role
      }
      return session
    },
  },

  pages:   { signIn: '/login' },
  session: { strategy: 'jwt' },

  // Suppress NextAuth's own error page redirect — return JSON instead
  logger: {
    error(code, metadata) { console.error('[NextAuth]', code, metadata) },
    warn(code)            { console.warn('[NextAuth]', code) },
  },
}

const nextAuthResult = NextAuth(authOptions)
export const handlers = nextAuthResult
export const { auth, signIn, signOut } = nextAuthResult as any
