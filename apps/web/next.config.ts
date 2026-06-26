import type { NextConfig } from 'next'

// Polyfill localStorage for SSR — fixes `--localstorage-file` Node flag
// creating a broken localStorage object that throws on .getItem
// This runs before any module that calls localStorage on the server
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage?.getItem !== 'function') {
  // @ts-ignore
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  }
}

const nextConfig: NextConfig = {
  experimental: {
    // Ensure packages/auth runs in nodejs runtime, not edge
    serverComponentsExternalPackages: ['@court-iq/auth', 'next-auth'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
