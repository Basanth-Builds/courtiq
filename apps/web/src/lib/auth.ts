import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
})

export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
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
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).phone = token.phone
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = verifyOtpSchema.safeParse(credentials)
        if (!parsed.success) return null
        // TODO: verify OTP with Twilio Verify API
        // Return user from DB after verification
        return null
      },
    }),
  ],
})
