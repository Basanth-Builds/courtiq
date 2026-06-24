import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Court IQ — Score it live. Run it smart.',
    template: '%s | Court IQ',
  },
  description:
    'The smartest tournament management platform for pickleball. Live scoring, automated seeding, playoff draws, and DUPR sync — all in one place.',
  keywords: ['pickleball', 'tournament', 'scoring', 'DUPR', 'Court IQ'],
  authors: [{ name: 'Court IQ' }],
  creator: 'Court IQ',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://courtiq.app',
    siteName: 'Court IQ',
    title: 'Court IQ — Score it live. Run it smart.',
    description: 'The smartest tournament management platform for pickleball.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Court IQ',
    description: 'The smartest tournament management platform for pickleball.',
  },
}

export const viewport: Viewport = {
  themeColor: '#A8D634',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
