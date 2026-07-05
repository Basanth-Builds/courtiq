import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

// Polyfill broken localStorage stub from --localstorage-file Node flag
if (typeof globalThis !== 'undefined') {
  const ls = (globalThis as any).localStorage
  if (!ls || typeof ls?.getItem !== 'function') {
    ;(globalThis as any).localStorage = {
      getItem: () => null, setItem: () => {}, removeItem: () => {},
      clear: () => {}, length: 0, key: () => null,
    }
  }
}

// Initialize OpenNext Cloudflare for local dev (enables getCloudflareContext in `next dev`)
initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  // Keep firebase-admin, next-auth, and prisma server-side only — never bundled into client
  serverExternalPackages: [
    'firebase-admin',
    'firebase-admin/app',
    'firebase-admin/auth',
    'next-auth',
    '@court-iq/auth',
    '@court-iq/db',
    '@prisma/client',
  ],
  distDir: '.next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
