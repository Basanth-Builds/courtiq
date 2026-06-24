// ============================================================
// Court IQ — NextAuth v5 Config
// Phone OTP via credentials provider
// ============================================================

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const OtpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
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

        // Dynamic import to avoid edge runtime issues
        const { userRepository } = await import('@court-iq/db')
        const session = await userRepository.verifyOtpSession(
          parsed.data.phone,
          parsed.data.code
        )
        if (!session) return null

        const user = await userRepository.upsertByPhone(parsed.data.phone)
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
        token.phone = (user as { phone?: string }).phone
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as { phone?: string }).phone = token.phone as string
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
