import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Tell Next.js the app root is src/ to avoid processing both app/ and src/app/
  // This prevents the ghost apps/web/app/ directory from being picked up
  experimental: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
