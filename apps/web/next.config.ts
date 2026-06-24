import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@court-iq/ui',
    '@court-iq/core',
    '@court-iq/db',
    '@court-iq/auth',
    '@court-iq/types',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
