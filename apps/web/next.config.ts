import type { NextConfig } from 'next'

// Polyfill broken localStorage stub from --localstorage-file Node flag
if (typeof globalThis !== 'undefined') {
  const ls = (globalThis as any).localStorage
  if (!ls || typeof ls?.getItem !== 'function') {
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

const nextConfig: NextConfig = {
  // Next.js 15: moved out of experimental
  serverExternalPackages: ['@court-iq/auth', 'next-auth', 'firebase-admin'],
  distDir: '.next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
