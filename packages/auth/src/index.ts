// Court IQ — Auth Package
// config.ts is NOT re-exported here to prevent eager NextAuth() init
// during SSR. Import directly from '@court-iq/auth/config' when needed.
export { handlers, signIn, signOut, auth } from './config'
export * from './roles'
export * from './otp'
export type { Session, User } from 'next-auth'
