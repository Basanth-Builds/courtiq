import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  transpilePackages: [
    '@court-iq/ui',
    '@court-iq/core',
    '@court-iq/auth',
    '@court-iq/types',
  ],
}

export default nextConfig
