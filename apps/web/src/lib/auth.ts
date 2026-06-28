// Re-export from the canonical auth package.
// Do NOT call NextAuth() here — it causes a duplicate SSR init
// that crashes with localStorage.getItem on the server.
export { auth, handlers, signIn, signOut } from '@court-iq/auth'
