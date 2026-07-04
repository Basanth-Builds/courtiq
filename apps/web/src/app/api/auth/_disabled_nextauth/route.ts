// NextAuth v4 App Router handler
import NextAuth from 'next-auth'
import { authOptions } from '@court-iq/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
