import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'phone-otp',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
      },
      async authorize(credentials) {
        if (!credentials?.phone) return null
        // TODO: lookup or create user via @court-iq/db
        return {
          id: credentials.phone as string,
          phone: credentials.phone as string,
          role: 'umpire',
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role
        token.phone = (user as Record<string, unknown>).phone
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string
        session.user.phone = token.phone as string
      }
      return session
    },
  },
  session: { strategy: 'jwt' },
})
